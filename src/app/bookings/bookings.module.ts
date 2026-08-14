import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

import { IconsModule } from '../icons/icons.module';
import { FooterModule } from '../footer/footer.module';
import { NavbarModule } from '../navbar/navbar.module';

import { BookingCardComponent } from './booking-card/booking-card.component';
import { BookingsEmptyComponent } from './bookings-empty/bookings-empty.component';
import { MyBookingsMainComponent } from './my-bookings-main/my-bookings-main.component';
import { ProviderBookingsMainComponent } from './provider-bookings-main/provider-bookings-main.component';
import { MyAvailabilityEditorComponent } from './my-availability-editor/my-availability-editor.component';

@NgModule({
  declarations: [
    BookingCardComponent,
    BookingsEmptyComponent,
    MyBookingsMainComponent,
    ProviderBookingsMainComponent,
    MyAvailabilityEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    IconsModule,
    FooterModule,
    NavbarModule
  ],
  exports: [
    MyBookingsMainComponent,
    ProviderBookingsMainComponent
  ]
})
export class MyBookingsModule { }
