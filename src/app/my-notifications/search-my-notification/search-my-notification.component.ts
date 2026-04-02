import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { debounceTime, fromEvent, map, switchMap, tap, of, Observable } from 'rxjs';
import { Notifications } from 'src/app/models/Notifications.interface';
import { NotificationStateService } from 'src/app/services/notification-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-search-my-notification',
  templateUrl: './search-my-notification.component.html',
  styleUrls: ['./search-my-notification.component.css']
})
export class SearchMyNotificationComponent {

  myNotifications: Notifications[] = [];
  filteredMyNotifications: Notifications[] = [];

  searchQuery: string = '';
  sortBy: string = 'all';

  startDate: string | null = null;
  endDate: string | null = null;

  @Output() results = new EventEmitter<Notifications[]>();

  sortOptions = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' }
  ];

  constructor(
    private snackbar: SnackBarService,
    private notificationState: NotificationStateService,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.notificationState.myNotificationData$.subscribe(data => {
      this.myNotifications = data;
      this.filteredMyNotifications = data;
      this.results.emit(this.myNotifications || []);

    });
  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }

  // ---------------------------------------------------------
  // SEARCH INITIALIZATION
  // ---------------------------------------------------------
  initializeSearch(): void {
    const input = this.elementRef.nativeElement.querySelector('input');

    if (!input) return;

    fromEvent(input, 'keyup')
      .pipe(
        debounceTime(200),
        map((e: any) => e.target.value),
        switchMap(query => this.search(query))
      )
      .subscribe(results => {
        this.results.emit(results);
      });
  }

  // ---------------------------------------------------------
  // SEARCH LOGIC
  // ---------------------------------------------------------
  search(query: string): Observable<Notifications[]> {
    this.searchQuery = query.toLowerCase();

    let results = this.myNotifications;

    // TEXT FILTER
    if (this.searchQuery.trim() !== '') {
      results = results.filter(n =>
        n.notification.toLowerCase().includes(this.searchQuery)
      );
    }

    // SORT FILTER
    results = this.applySort(results);

    // DATE RANGE FILTER
    if (this.startDate && this.endDate) {
      results = this.applyDateRangeFilter(results);
    }

    this.filteredMyNotifications = results;
    return of(results);
  }

  // ---------------------------------------------------------
  // SORTING LOGIC
  // ---------------------------------------------------------
  setSort(key: string): void {
    this.sortBy = key;
    this.search(this.searchQuery).subscribe(results => {
      this.results.emit(results);
    });
  }

  applySort(list: Notifications[]): Notifications[] {
    const now = new Date();

    return list.filter(n => {
      const d = new Date(n.date);

      switch (this.sortBy) {
        case 'today':
          return d.toDateString() === now.toDateString();

        case 'yesterday':
          const y = new Date(now);
          y.setDate(now.getDate() - 1);
          return d.toDateString() === y.toDateString();

        case 'week':
          const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
          return diff <= 7;

        case 'month':
          return d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();

        default:
          return true;
      }
    });
  }

  // ---------------------------------------------------------
  // DATE RANGE FILTER
  // ---------------------------------------------------------
  applyDateRange(): void {
    this.search(this.searchQuery).subscribe(results => {
      this.results.emit(results);
    });
  }

  applyDateRangeFilter(list: Notifications[]): Notifications[] {
    const start = new Date(this.startDate!);
    const end = new Date(this.endDate!);

    return list.filter(n => {
      const d = new Date(n.date);
      return d >= start && d <= end;
    });
  }

  // ---------------------------------------------------------
  // CLEAR SEARCH
  // ---------------------------------------------------------
  clearSearch(): void {
    this.searchQuery = '';
    this.startDate = null;
    this.endDate = null;
    this.sortBy = 'all';

    this.filteredMyNotifications = this.myNotifications;
    this.results.emit(this.myNotifications);
  }
}
