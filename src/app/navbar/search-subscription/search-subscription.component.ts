import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubscriptionStateService } from 'src/app/services/subscription-state.service';

@Component({
  selector: 'app-search-subscription',
  templateUrl: './search-subscription.component.html',
  styleUrls: ['./search-subscription.component.css']
})
export class SearchSubscriptionComponent {
  centersData: Subscriptions[] = [];
  filteredSubscriptionsData: Subscriptions[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  @Output() results: EventEmitter<Subscriptions[]> = new EventEmitter<Subscriptions[]>()
  subscriptions: Subscription[] = []

  constructor(private subscriptionStateService: SubscriptionStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => (sub.unsubscribe()))
  }

  initializeSearch(): void {
    fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap(() => {
          this.ngxService.start();
        }),
        switchMap((query: string) => {
          return this.search(query); // Perform the search with the query
        })
      )
      .subscribe(
        (results: Subscriptions[]) => {
          this.ngxService.stop();
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  // Function to handle the search select change event
  onSearchCriteriaChange(event: any): void {
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
  }

  search(query: string): Observable<Subscriptions[]> {
    this.subscriptions.push(
      this.subscriptionStateService.allSubscriptionsData$.subscribe((cachedData => {
        this.centersData = cachedData
      }))
    )
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredSubscriptionsData = this.centersData;
    }
    this.filteredSubscriptionsData = this.centersData.filter((trainer: Subscriptions) => {
      switch (this.selectedSearchCriteria) {
        case 'email':
          return trainer.user.email.toLowerCase().includes(query);
        case 'center':
          return trainer.center?.name.toLowerCase().includes(query);
        case 'trainer':
          return trainer.trainer?.name.toLowerCase().includes(query);
        case 'id':
          return trainer.id.toString().includes(query);
        case 'paymentId':
          return trainer.payment.id.toString().includes(query);
        case 'status':
          return trainer.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    return of(this.filteredSubscriptionsData);
  }

}

