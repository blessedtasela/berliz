import { Actions } from '@ngrx/effects';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Payments } from 'src/app/models/payment.interface';
import { loadPayments, loadPaymentsFailure, loadPaymentsSuccess } from 'src/app/state/payment/payment.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { selectPayments } from 'src/app/state/payment/payment.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
    selector: 'app-payments',
    templateUrl: './payments.component.html',
    styleUrls: ['./payments.component.css'],
    standalone: false
})
export class PaymentsComponent {
  paymentsData: Payments[] = [];
  totalPayments: number = 0;
  paymentsLength: number = 0;
  searchComponent: string = 'payment'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];
  /** Why the list couldn't be loaded -- so a failed load never reads as an empty table. */
  loadError: string | null = null;

  readonly selectPayments = selectPayments;
  readonly paymentSearchFields: AdminSearchField<Payments>[] = [
    { value: 'user', label: 'User email', accessor: p => p.userEmail },
    { value: 'payer', label: 'Payer email', accessor: p => p.payerEmail },
    { value: 'method', label: 'Payment method', accessor: p => p.paymentMethod },
    { value: 'status', label: 'Status', accessor: p => p.status },
    { value: 'id', label: 'Payment id', accessor: p => p.id?.toString() },
  ];

  constructor(public store: Store, private actions$: Actions) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => (subscription.unsubscribe()));
  }

  handleEmitEvent() {
    this.subscriptions.push(watchLoadError(this.actions$, loadPaymentsFailure, [loadPayments, loadPaymentsSuccess], null, m => this.loadError = m));
    this.store.dispatch(loadPayments());
    this.subscriptions.push(
      this.store.select(selectPayments).subscribe((allPayments) => {
        this.paymentsData = allPayments;
        this.totalPayments = allPayments.length
        this.paymentsLength = allPayments.length
      }),
    );
  }

  handleSearchResults(results: Payments[]): void {
    this.paymentsData = results;
    this.totalPayments = results.length;
  }


  retryLoad(): void {
    this.store.dispatch(loadPayments());
  }
}
