import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { IconsModule } from '../icons/icons.module';

@NgModule({
  declarations: [
    BookingFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    IconsModule
  ]
})
export class BookingModule { }
