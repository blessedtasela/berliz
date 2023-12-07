import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyNotificationsComponent } from './my-notifications/my-notifications.component';
import { MyNotificationsPageComponent } from './my-notifications-page/my-notifications-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterModule } from '../footer/footer.module';
import { IconsModule } from '../icons/icons.module';
import { NavbarModule } from '../navbar/navbar.module';



@NgModule({
  declarations: [
    MyNotificationsComponent,
    MyNotificationsPageComponent
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
export class MyNotificationsModule { }
