import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { IconsModule } from 'src/app/icons/icons.module';
import { AdminAvailabilityModalComponent } from './admin-availability-modal/admin-availability-modal.component';

/**
 * Shared standalone module for the admin availability-editing modal, so it
 * can be declared once and imported into both the Trainers and Centers admin
 * feature modules (a component can only be declared in one NgModule).
 */
@NgModule({
  declarations: [
    AdminAvailabilityModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    IconsModule,
  ],
  exports: [
    AdminAvailabilityModalComponent,
  ]
})
export class AdminAvailabilityModule { }
