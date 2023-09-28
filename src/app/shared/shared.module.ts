import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerFormModalComponent } from './partner-form-modal/partner-form-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';
import { IconsModule } from '../icons/icons.module';
import { PromptModalComponent } from './prompt-modal/prompt-modal.component';
import { TrainerFormModalComponent } from './trainer-form-modal/trainer-form-modal.component';
import { CenterFormModalComponent } from './center-form-modal/center-form-modal.component';
import { DriverFormModalComponent } from './driver-form-modal/driver-form-modal.component';
import { StoreFormModalComponent } from './store-form-modal/store-form-modal.component';
import { ViewCvModalComponent } from './view-cv-modal/view-cv-modal.component';
import { ViewCertificateModalComponent } from './view-certificate-modal/view-certificate-modal.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { UpdateTrainerModalComponent } from './update-trainer-modal/update-trainer-modal.component';
import { UpdateTrainerPhotoModalComponent } from './update-trainer-photo-modal/update-trainer-photo-modal.component';



@NgModule({
  declarations: [
    PartnerFormModalComponent,
    PromptModalComponent,
    TrainerFormModalComponent,
    CenterFormModalComponent,
    DriverFormModalComponent,
    StoreFormModalComponent,
    ViewCvModalComponent,
    ViewCertificateModalComponent,
    UpdateTrainerModalComponent,
    UpdateTrainerPhotoModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FeatherModule,
    IconsModule,
    NgxExtendedPdfViewerModule
  ]
})
export class SharedModule { }
