import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateCenterPricingsModalComponent } from './update-center-pricings-modal/update-center-pricings-modal.component';
import { AddCenterPricingsModalComponent } from './add-center-pricings-modal/add-center-pricings-modal.component';
import { CenterPricingsDetailsModalComponent } from './center-pricings-details-modal/center-pricings-details-modal.component';
import { CenterPricingsListComponent } from './center-pricings-list/center-pricings-list.component';
import { CenterPricingsComponent } from './center-pricings/center-pricings.component';
import { CenterPricingsHeaderComponent } from './center-pricings-header/center-pricings-header.component';



@NgModule({
  declarations: [
    UpdateCenterPricingsModalComponent,
    AddCenterPricingsModalComponent,
    CenterPricingsDetailsModalComponent,
    CenterPricingsListComponent,
    CenterPricingsComponent,
    CenterPricingsHeaderComponent
  ],
  imports: [
    CommonModule
  ]
})
export class CenterPricingModule { }
