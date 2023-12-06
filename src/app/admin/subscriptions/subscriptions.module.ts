import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionsModalComponent } from './subscriptions-modal/subscriptions-modal.component';
import { AddSubscriptionsModalComponent } from './add-subscriptions-modal/add-subscriptions-modal.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { SubscriptionsListComponent } from './subscriptions-list/subscriptions-list.component';
import { UpdateSubscriptionsModalComponent } from './update-subscriptions-modal/update-subscriptions-modal.component';
import { SubscriptionDetailsModalComponent } from './subscription-details-modal/subscription-details-modal.component';
import { SubscriptionsHeaderComponent } from './subscriptions-header/subscriptions-header.component';



@NgModule({
  declarations: [
    SubscriptionsModalComponent,
    AddSubscriptionsModalComponent,
    SubscriptionsComponent,
    SubscriptionsListComponent,
    UpdateSubscriptionsModalComponent,
    SubscriptionDetailsModalComponent,
    SubscriptionsHeaderComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SubscriptionsModule { }
