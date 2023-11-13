import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubcriptionPageComponent } from './subcription-page/subcription-page.component';
import { SubscriptionPageComponent } from './subscription-page/subscription-page.component';



@NgModule({
  declarations: [
    SubcriptionPageComponent,
    SubscriptionPageComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SubscriptionsModule { }
