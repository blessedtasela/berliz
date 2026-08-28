import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MySubscriptionsComponent } from './my-subscriptions/my-subscriptions.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterModule } from '../footer/footer.module';
import { IconsModule } from '../icons/icons.module';
import { NavbarModule } from '../navbar/navbar.module';
import { MySubscriptionDetailModalComponent } from './my-subscription-detail-modal/my-subscription-detail-modal.component';
import { SubscriptionFormComponent } from './subscription-form/subscription-form.component';
import { MySubscriptionsMainComponent } from './my-subscriptions-main/my-subscriptions-main.component';
import { MySubscriptionsPlansComponent } from './my-subscriptions-plans/my-subscriptions-plans.component';
import { MySubscriptionsListComponent } from './my-subscriptions-list/my-subscriptions-list.component';
import { MySubscriptionsEmptyComponent } from './my-subscriptions-empty/my-subscriptions-empty.component';
import { MySubscriptionsDueComponent } from './my-subscriptions-due/my-subscriptions-due.component';
import { MySubscriptionsActiveComponent } from './my-subscriptions-active/my-subscriptions-active.component';
import { MySubscriptionsActionComponent } from './my-subscriptions-action/my-subscriptions-action.component';
import { MySubscriptionsExpiredComponent } from './my-subscriptions-expired/my-subscriptions-expired.component';
import { MySubscriptionsBulkActionComponent } from './my-subscriptions-bulk-action/my-subscriptions-bulk-action.component';
import { FeatherModule } from 'angular-feather';
import { MySubscriptionsFormComponent } from './my-subscriptions-form/my-subscriptions-form.component';
import { MySubscriptionsTimelineComponent } from './my-subscriptions-timeline/my-subscriptions-timeline.component';
import { MySubscriptionsAnalyticsComponent } from './my-subscriptions-analytics/my-subscriptions-analytics.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    MySubscriptionsComponent,
    MySubscriptionDetailModalComponent,
    SubscriptionFormComponent,
    MySubscriptionsMainComponent,
    MySubscriptionsPlansComponent,
    MySubscriptionsListComponent,
    MySubscriptionsEmptyComponent,
    MySubscriptionsDueComponent,
    MySubscriptionsActiveComponent,
    MySubscriptionsActionComponent,
    MySubscriptionsExpiredComponent,
    MySubscriptionsBulkActionComponent,
    MySubscriptionsFormComponent,
    MySubscriptionsTimelineComponent,
    MySubscriptionsAnalyticsComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    NavbarModule,
    FooterModule,
    FormsModule,
    ReactiveFormsModule,
    FeatherModule,
    SharedModule
  ]
})
export class MySubscriptionsModule { }
