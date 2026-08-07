import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Payments } from 'src/app/models/payment.interface';
import { loadPayments } from 'src/app/state/payment/payment.actions';
import { selectPayments } from 'src/app/state/payment/payment.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent {
  paymentsData: Payments[] = [];
  totalPayments: number = 0;
  paymentsLength: number = 0;
  searchComponent: string = 'payment'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];

  readonly selectPayments = selectPayments;
  readonly paymentSearchFields: AdminSearchField<Payments>[] = [
    { value: 'user', label: 'User email', accessor: p => p.userEmail },
    { value: 'payer', label: 'Payer email', accessor: p => p.payerEmail },
    { value: 'method', label: 'Payment method', accessor: p => p.paymentMethod },
    { value: 'status', label: 'Status', accessor: p => p.status },
    { value: 'id', label: 'Payment id', accessor: p => p.id?.toString() },
  ];

  constructor(private ngxService: NgxUiLoaderService,
    public store: Store) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => (subscription.unsubscribe()));
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadPayments());
    this.subscriptions.push(
      this.store.select(selectPayments).subscribe((allPayments) => {
        this.paymentsData = allPayments;
        this.totalPayments = allPayments.length
        this.paymentsLength = allPayments.length
        this.ngxService.stop()
      }),
    );
  }

  handleSearchResults(results: Payments[]): void {
    this.paymentsData = results;
    this.totalPayments = results.length;
  }

}
