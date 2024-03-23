import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerComponent } from './partner/partner.component';
import { CenterComponent } from './center/center.component';
import { CenterDataComponent } from './center-data/center-data.component';
import { PartnerNullComponent } from './partner-null/partner-null.component';
import { PartnerApplicationComponent } from './partner-application/partner-application.component';
import { PartnerDataComponent } from './partner-data/partner-data.component';
import { TrainerComponent } from './trainer/trainer.component';
import { TrainerDataComponent } from './trainer-data/trainer-data.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from '../icons/icons.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { RouterModule } from '@angular/router';
import { PartnerRouteComponent } from './partner-route/partner-route.component';



@NgModule({
  declarations: [
    PartnerComponent,
    CenterComponent,
    CenterDataComponent,
    PartnerNullComponent,
    PartnerApplicationComponent,
    PartnerDataComponent,
    TrainerComponent,
    TrainerDataComponent,
    PartnerRouteComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconsModule,
    ImageCropperModule,
    RouterModule
  ]
})
export class PartnerModule { }
