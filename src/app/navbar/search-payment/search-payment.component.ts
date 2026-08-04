import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Payments } from 'src/app/models/payment.interface';
import { selectPayments } from 'src/app/state/payment/payment.selectors';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-search-payment',
  templateUrl: './search-payment.component.html',
  styleUrls: ['./search-payment.component.css']
})
export class SearchPaymentComponent {
  paymentsData: Payments[] = [];
  filteredPaymentsData: Payments[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  @Output() results: EventEmitter<Payments[]> = new EventEmitter<Payments[]>()
  subscriptions: Subscription[] = []

  constructor(private store: Store,
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
        (results: Payments[]) => {
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

  search(query: string): Observable<Payments[]> {
    this.subscriptions.push(
      this.store.select(selectPayments).subscribe((cachedData => {
        this.paymentsData = cachedData
      }))
    )
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredPaymentsData = this.paymentsData;
    }
    this.filteredPaymentsData = this.paymentsData.filter((payment: Payments) => {
      switch (this.selectedSearchCriteria) {
        case 'payer':
          return payment.userFirstname.toLowerCase().includes(query);
        case 'email':
          return payment.userEmail.toLowerCase().includes(query);
        case 'amount':
          return payment.amount.toString().includes(query);
        case 'id':
          return payment.id.toString().includes(query);
        case 'method':
          return payment.paymentMethod.toLocaleLowerCase().includes(query);
        case 'status':
          return payment.status.toLocaleLowerCase().includes(query);
        default:
          return false;
      }
    });
    return of(this.filteredPaymentsData);
  }

}
