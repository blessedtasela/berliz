import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddSubscriptionsModalComponent } from './add-subscriptions-modal/add-subscriptions-modal.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { SubscriptionsListComponent } from './subscriptions-list/subscriptions-list.component';
import { UpdateSubscriptionsModalComponent } from './update-subscriptions-modal/update-subscriptions-modal.component';
import { SubscriptionDetailsModalComponent } from './subscription-details-modal/subscription-details-modal.component';
import { SubscriptionsHeaderComponent } from './subscriptions-header/subscriptions-header.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';



@NgModule({
  declarations: [
    AddSubscriptionsModalComponent,
    SubscriptionsComponent,
    SubscriptionsListComponent,
    UpdateSubscriptionsModalComponent,
    SubscriptionDetailsModalComponent,
    SubscriptionsHeaderComponent
  ],
  imports: [
    CommonModule,
    FooterModule,
    NavbarModule,
    ReactiveFormsModule,
    FormsModule,
    IconsModule
  ]
})
export class SubscriptionsModule { }
