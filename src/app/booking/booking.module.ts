import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { IconsModule } from '../icons/icons.module';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';
import { DateStripComponent } from 'src/app/shared/date-strip/date-strip.component';
import { TimePickerComponent } from 'src/app/shared/time-picker/time-picker.component';

@NgModule({
  declarations: [
    BookingFormComponent
  ],
  imports: [
    ClickablePhotoDirective,
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    IconsModule,
    DateStripComponent,
    TimePickerComponent
  ]
})
export class BookingModule { }
