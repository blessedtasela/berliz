import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MySubscriptionsComponent } from './my-subscriptions/my-subscriptions.component';
import { MySubscriptionsPageComponent } from './my-subscriptions-page/my-subscriptions-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterModule } from '../footer/footer.module';
import { IconsModule } from '../icons/icons.module';
import { NavbarModule } from '../navbar/navbar.module';
import { MySubscriptionDetailModalComponent } from './my-subscription-detail-modal/my-subscription-detail-modal.component';
import { SubscriptionPlansComponent } from './subscription-plans/subscription-plans.component';
import { SubscriptionFormComponent } from './subscription-form/subscription-form.component';



@NgModule({
  declarations: [
    MySubscriptionsComponent,
    MySubscriptionsPageComponent,
    MySubscriptionDetailModalComponent,
    SubscriptionPlansComponent,
    SubscriptionFormComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    NavbarModule,
    FooterModule,
    FormsModule,
     ReactiveFormsModule
  ]
})
export class MySubscriptionsModule { }
