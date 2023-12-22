import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Payments } from 'src/app/models/payment.interface';
import { PaymentStateService } from 'src/app/services/payment-state.service';

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

  constructor(private ngxService: NgxUiLoaderService,
    public paymentStateService: PaymentStateService) {
  }

  ngOnInit(): void {
    this.paymentStateService.allPaymentsData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.paymentsData = cachedData;
        this.totalPayments = cachedData.length
        this.paymentsLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.paymentStateService.getAllPayments().subscribe((allPayments) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.paymentsData = allPayments;
      this.totalPayments = allPayments.length
      this.paymentsLength = allPayments.length
      this.paymentStateService.setAllPaymentsSubject(this.paymentsData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: Payments[]): void {
    this.paymentsData = results;
    this.totalPayments = results.length;
  }

}
