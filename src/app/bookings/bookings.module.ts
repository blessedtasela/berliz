import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

import { IconsModule } from '../icons/icons.module';
import { FooterModule } from '../footer/footer.module';
import { NavbarModule } from '../navbar/navbar.module';
import { SharedModule } from '../shared/shared.module';
import { DateStripComponent } from '../shared/date-strip/date-strip.component';
import { TimePickerComponent } from '../shared/time-picker/time-picker.component';
import { BookingLocationPickerComponent } from '../booking/booking-location-picker/booking-location-picker.component';

import { BookingCardComponent } from './booking-card/booking-card.component';
import { BookingsEmptyComponent } from './bookings-empty/bookings-empty.component';
import { MyBookingsMainComponent } from './my-bookings-main/my-bookings-main.component';
import { ProviderBookingsMainComponent } from './provider-bookings-main/provider-bookings-main.component';
import { MyAvailabilityEditorComponent } from './my-availability-editor/my-availability-editor.component';
import { EarningsViewComponent } from './earnings-view/earnings-view.component';
import { ManageBookingsComponent } from './manage-bookings/manage-bookings.component';
import { ReviewBookingModalComponent } from './review-booking-modal/review-booking-modal.component';
import { BookingDetailsModalComponent } from './booking-details-modal/booking-details-modal.component';
import { BookForClientModalComponent } from './book-for-client-modal/book-for-client-modal.component';

@NgModule({
  declarations: [
    BookingCardComponent,
    BookingsEmptyComponent,
    MyBookingsMainComponent,
    ProviderBookingsMainComponent,
    MyAvailabilityEditorComponent,
    EarningsViewComponent,
    ManageBookingsComponent,
    ReviewBookingModalComponent,
    BookingDetailsModalComponent,
    BookForClientModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    IconsModule,
    FooterModule,
    NavbarModule,
    RouterModule,
    SharedModule,
    DateStripComponent,
    TimePickerComponent,
    BookingLocationPickerComponent
  ],
  exports: [
    MyBookingsMainComponent,
    ProviderBookingsMainComponent,
    ManageBookingsComponent,
    MyAvailabilityEditorComponent
  ]
})
export class MyBookingsModule { }
