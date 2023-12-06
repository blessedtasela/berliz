import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentsComponent } from './payments/payments.component';
import { PaymentsListComponent } from './payments-list/payments-list.component';
import { PaymentsHeaderComponent } from './payments-header/payments-header.component';
import { AddPaymentsModalComponent } from './add-payments-modal/add-payments-modal.component';
import { UpdatePaymentsModalComponent } from './update-payments-modal/update-payments-modal.component';
import { PaymentDetailsModalComponent } from './payment-details-modal/payment-details-modal.component';



@NgModule({
  declarations: [
    PaymentsComponent,
    PaymentsListComponent,
    PaymentsHeaderComponent,
    AddPaymentsModalComponent,
    UpdatePaymentsModalComponent,
    PaymentDetailsModalComponent
  ],
  imports: [
    CommonModule
  ]
})
export class PaymentsModule { }
