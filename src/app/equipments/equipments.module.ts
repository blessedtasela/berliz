import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

import { IconsModule } from '../icons/icons.module';
import { EquipmentPageComponent } from './equipment-page/equipment-page.component';
import { EquipmentDetailsModalComponent } from './equipment-details-modal/equipment-details-modal.component';
import { StrapiUrlPipe } from '../shared/pipes/strapi-url.pipe';



@NgModule({
  declarations: [
    EquipmentPageComponent,
    EquipmentDetailsModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    IconsModule,
    StrapiUrlPipe
  ],
  exports: [
    // Rendered as the gear section of the Programs page (`/services`).
    EquipmentPageComponent
  ]
})
export class EquipmentsModule { }
