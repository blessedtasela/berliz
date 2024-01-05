import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddTrainerPricingModalComponent } from './add-trainer-pricing-modal/add-trainer-pricing-modal.component';
import { TrainerPricingDetailsModalComponent } from './trainer-pricing-details-modal/trainer-pricing-details-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { TrainerPricingComponent } from './trainer-pricing/trainer-pricing.component';
import { TrainerPricingListComponent } from './trainer-pricing-list/trainer-pricing-list.component';
import { TrainerPricingHeaderComponent } from './trainer-pricing-header/trainer-pricing-header.component';
import { UpdateTrainerPricingModalComponent } from './update-trainer-pricing-modal/update-trainer-pricing-modal.component';



@NgModule({
  declarations: [
    AddTrainerPricingModalComponent,
    TrainerPricingDetailsModalComponent,
    TrainerPricingComponent,
    TrainerPricingListComponent,
    TrainerPricingHeaderComponent,
    UpdateTrainerPricingModalComponent
  ],
  imports: [
    CommonModule,
    NavbarModule,
    FooterModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
  ]
})
export class TrainerPricingModule { }
