import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentsComponent } from './payments/payments.component';
import { PaymentsListComponent } from './payments-list/payments-list.component';
import { PaymentsHeaderComponent } from './payments-header/payments-header.component';
import { AddPaymentsModalComponent } from './add-payments-modal/add-payments-modal.component';
import { UpdatePaymentsModalComponent } from './update-payments-modal/update-payments-modal.component';
import { PaymentDetailsModalComponent } from './payment-details-modal/payment-details-modal.component';
import { PaymentDetailPageComponent } from './payment-detail-page/payment-detail-page.component';
import { FooterModule } from 'src/app/footer/footer.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from 'src/app/icons/icons.module';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { AuthGuard } from 'src/app/services/auth.guard';



@NgModule({
  declarations: [
    PaymentsComponent,
    PaymentsListComponent,
    PaymentsHeaderComponent,
    AddPaymentsModalComponent,
    UpdatePaymentsModalComponent,
    PaymentDetailsModalComponent,
    PaymentDetailPageComponent
  ],
  imports: [
    CommonModule,
    FooterModule,
    NavbarModule,
    ReactiveFormsModule,
    FormsModule,
    IconsModule,
    AdminSearchModule,
    RouterModule.forChild([
      { path: '', component: PaymentsComponent },
      { path: ':id', component: PaymentDetailPageComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Payment Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class PaymentsModule { }
