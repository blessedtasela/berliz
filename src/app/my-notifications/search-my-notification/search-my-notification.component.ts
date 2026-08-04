import { AfterViewInit, Component, ElementRef, EventEmitter, NgZone, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { debounceTime, fromEvent, map, switchMap, of, Observable } from 'rxjs';
import { Notifications } from 'src/app/models/Notifications.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectMyNotifications } from 'src/app/state/notification/notification.selector';

@Component({
  selector: 'app-search-my-notification',
  templateUrl: './search-my-notification.component.html',
  styleUrls: ['./search-my-notification.component.css']
})
export class SearchMyNotificationComponent implements OnInit, AfterViewInit {

  @Output() results = new EventEmitter<Notifications[]>();

  myNotifications: Notifications[] = [];
  filtered: Notifications[] = [];

  searchQuery = '';
  selectedSorts: string[] = [];

  drawerOpen = false;

  startDate: string | null = null;
  endDate: string | null = null;
  dateRangeError: string | null = null;

  // PRIORITY FIRST
  sortOptions = [
    { key: 'all', label: 'All', priority: true },
    { key: 'unread', label: 'Unread', priority: true },
    { key: 'read', label: 'Read', priority: true },
    { key: 'today', label: 'Today', priority: true },
    { key: 'yesterday', label: 'Yesterday', priority: true },

    // SECONDARY
    { key: 'week', label: 'This Week', priority: false },
    { key: 'month', label: 'This Month', priority: false },
    { key: 'range', label: 'Date Range', priority: false }
  ];

  visibleSortOptions: { key: string; label: string; priority: boolean; }[] = [];
  showMoreButton = true;

  constructor(
    private store: Store,
    private elementRef: ElementRef,
    private ngZone: NgZone,
    private snackbar: SnackBarService
  ) { }

  ngOnInit(): void {
    this.store.select(selectMyNotifications).subscribe(data => {
      this.myNotifications = data;
      this.filtered = data;
      // this.safeEmit(data);

      this.updateVisibleOptions();
    });
  }

  ngAfterViewInit(): void {
    this.listenToSearchInput();
  }

  listenToSearchInput(): void {
    const input = this.elementRef.nativeElement.querySelector('input');
    if (!input) return;

    fromEvent(input, 'keyup')
      .pipe(
        debounceTime(200),
        map((e: any) => {
          this.searchQuery = e.target.value; // 🔥 KEEP STATE IN SYNC
          return e.target.value;
        }),

        switchMap(() => this.applyAllFilters(this.searchQuery))
      )
      .subscribe(res => this.safeEmit(res));

    window.addEventListener('resize', () => {
      this.ngZone.run(() => this.updateVisibleOptions());
    });
  }

  private safeEmit(list: Notifications[]) {
    console.log('🔥 EMIT:', list.length);
    this.results.emit(list ?? []);
  }

  updateVisibleOptions(): void {
    const width = window.innerWidth;

    if (width < 640) {
      // PHONES ONLY → show 3 priority chips
      this.visibleSortOptions = this.sortOptions.slice(0, 3);
    } else {
      // TABLETS + LAPTOPS + DESKTOPS → show 5 priority chips
      this.visibleSortOptions = this.sortOptions.slice(0, 5);
    }

    this.toggleDrawer(); // Close drawer on resize to prevent stuck open state
  }

  toggleDrawer(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  toggleSort(key: string): void {

    if (key === 'range') {
      // Date range is additive, not exclusive
      if (!this.selectedSorts.includes('range')) {
        this.selectedSorts.push('range');
      }
      return; // Do NOT apply instantly
    }

    // Normal toggle for all other filters
    if (this.selectedSorts.includes(key)) {
      this.selectedSorts = this.selectedSorts.filter(k => k !== key);
    } else {
      this.selectedSorts.push(key);
    }

    // Apply instantly for all except date range
    this.applyAllFilters(this.searchQuery).subscribe(res => this.safeEmit(res));
  }

  // RESET FILTERS
  resetFilters(): void {
    this.selectedSorts = [];
    this.startDate = null;
    this.endDate = null;

    this.applyAllFilters(this.searchQuery).subscribe(res => this.safeEmit(res));
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.resetFilters();
  }

  // MASTER FILTER PIPELINE
  applyAllFilters(query: string): Observable<Notifications[]> {
    let list = [...this.myNotifications];

    // TEXT FILTER
    if (query.trim() !== '') {
      list = list.filter(n =>
        n.notification.toLowerCase().includes(query.toLowerCase())
      );
    }

    // SORT FILTERS (read/unread/today/etc)
    list = this.applySortFilters(list);

    // DATE RANGE (additive)
    if (this.selectedSorts.includes('range') && this.startDate && this.endDate) {
      list = this.applyDateRangeFilter(list);
    }


    this.filtered = list ?? [];
    return of(this.filtered);

  }

  // MULTI-SELECT SORTING
  applySortFilters(list: Notifications[]): Notifications[] {
    console.log('Applying sort filters:', this.selectedSorts);
    console.log('Selected sorts:', this.selectedSorts);
    if (this.selectedSorts.length === 0) {
      return list;
    }

    const now = new Date();

    return list.filter(n => {
      const d = new Date(n.date);
      const normalize = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      };

      const today = normalize(now);
      const yesterday = normalize(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
      const itemDate = normalize(d);

      return this.selectedSorts.some(sort => {

        switch (sort) {
          // default to not showing item if sort key is unrecognized
          case 'all':
            return true;

          case 'unread':
            return !n.read;

          case 'read':
            return n.read;

          case 'today':
            return d.toDateString() === now.toDateString();

          case 'yesterday':
            const y = new Date();
            y.setDate(now.getDate() - 1);
            return d.toDateString() === y.toDateString();

          case 'week':
            return (now.getTime() - d.getTime()) / 86400000 <= 7;

          case 'month':
            return d.getMonth() === now.getMonth() &&
              d.getFullYear() === now.getFullYear();

          default:
            return true;
        }
      });
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


  applyDateRange(): void {
    const error = this.validateDateRange();

    if (error) {
      this.dateRangeError = error;
      // this.snackbar.openSnackBar(error, "error");
      return;
    }

    this.dateRangeError = null;

    this.applyAllFilters(this.searchQuery)
      .subscribe(res => this.safeEmit(res));
  }


  // 🔍 Pure validation function
  validateDateRange(): string | null {
    if (!this.startDate || !this.endDate) {
      return "Please select both start and end dates.";
    }

    const start = this.normalizeDate(this.startDate);
    const end = this.normalizeDate(this.endDate);
    const today = this.normalizeDate(new Date());

    if (end < start) {
      return "End date cannot be before the start date.";
    }

    if (start > today || end > today) {
      return "Please select dates up to today.";
    }

    return null; // ✅ valid
  }


  // ✅ Getter (NO side effects)
  get isDateRangeValid(): boolean {
    return this.validateDateRange() === null;
  }


  // 🧠 Normalize date (removes time)
  private normalizeDate(date: Date | string): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }


  // ✨ Optional: clear error when user changes date
  onDateChange(): void {
    this.dateRangeError = null;
  }

  // ACTIVE FILTER SUMMARY
  get activeFilters(): string[] {
    return this.selectedSorts
      .filter(k => k !== 'range')
      .map(k => this.sortOptions.find(o => o.key === k)?.label || '');
  }

}
