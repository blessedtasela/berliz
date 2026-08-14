import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { fromEvent, map, debounceTime, tap, switchMap, distinctUntilChanged, Observable, of, Subscription } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectActiveCenters } from 'src/app/state/center/center.selectors';

@Component({
  selector: 'app-center-search',
  templateUrl: './center-search.component.html',
  styleUrls: ['./center-search.component.css']
})
export class CenterSearchComponent {
  @Input() centers: Centers[] = [];
  activeCenters: Centers[] = [];
  @Output() allCenters: EventEmitter<Centers[]> = new EventEmitter<Centers[]>();
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  subscription!: Subscription;

  constructor(private store: Store,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.watchUpdateCenterStatus()
  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  handleEmitEvent() {
    this.subscription = new Subscription();
    this.subscription.add(
      this.store.select(selectActiveCenters).subscribe((center) => {
        this.initializeSearch();
        this.centers = center
        this.activeCenters = this.centers
      })
    )
  }

  initializeSearch(): void {
    fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap((query: string) => {
        }),
        switchMap((query: string) => {
          return this.search(query);
        })
      )
      .subscribe(
        (results: Centers[]) => {
          this.allCenters.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
        }
      );
  }

  searchByButton(): void {
    const query = this.searchQuery?.trim();

    if (!query) {
      this.snackbarService.openSnackBar('Please enter a search term.', 'error');
      return;
    }


    this.search(query).subscribe(
      (results) => {
        this.allCenters.emit(results);
      },
      (error) => {
        this.snackbarService.openSnackBar('Search failed.', 'error');
      }
    );
  }

  // Function to handle the search select change event
  onSearchCriteriaChange(): void {
    this.searchByButton();
  }

  search(query: string): Observable<Centers[]> {
    this.store.select(selectActiveCenters).subscribe((cachedData) => {
      this.activeCenters = cachedData;
    });
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.centers = this.activeCenters;
    }
    this.centers = this.activeCenters.filter((center: Centers) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return center.name.toLowerCase().includes(query);
        case 'category':
          return center.categoryIds.some(id => id.toString().includes(query));
        case 'address':
          return center.address.toLowerCase().includes(query);
        default:
          return this.activeCenters;
      }
    });
    return of(this.centers);
  }

  watchUpdateCenterStatus() {
    this.rxStompService.watch('/topic/updateCenterStatus').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      if (receivedCenter.status === 'true') {
        this.centers.push(receivedCenter);
      } else {
        this.centers = this.centers.filter(center => center.id !== receivedCenter.id);
      }
    });
  }

}
