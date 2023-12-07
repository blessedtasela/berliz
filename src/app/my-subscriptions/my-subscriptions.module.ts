import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MySubscriptionsComponent } from './my-subscriptions/my-subscriptions.component';
import { MySubscriptionsPageComponent } from './my-subscriptions-page/my-subscriptions-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterModule } from '../footer/footer.module';
import { IconsModule } from '../icons/icons.module';
import { NavbarModule } from '../navbar/navbar.module';



@NgModule({
  declarations: [
    MySubscriptionsComponent,
    MySubscriptionsPageComponent
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
