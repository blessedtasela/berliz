import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Payments } from 'src/app/models/payment.interface';
import { loadPayments } from 'src/app/state/payment/payment.actions';
import { selectPayments } from 'src/app/state/payment/payment.selectors';

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
