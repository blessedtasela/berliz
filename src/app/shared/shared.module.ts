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
import { UpdateTrainerPhotoModalComponent } from './update-trainer-photo-modal/update-trainer-photo-modal.component';
import { NewsletterPopupComponent } from './newsletter-popup/newsletter-popup.component';
import { ValidationMessageComponent } from './validation-message/validation-message.component';
import { LocationFormComponent } from './location-form/location-form.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NotificationDetailsComponent } from './notification-details/notification-details.component';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { StrapiUrlPipe } from './pipes/strapi-url.pipe';
import { TodoDetailsModalComponent } from './todo-details-modal/todo-details-modal.component';
import { UpdateEmailModalComponent } from './update-email-modal/update-email-modal.component';
import { UpdateUserModalComponent } from './update-user-modal/update-user-modal.component';
import { ChangePasswordModalComponent } from './change-password-modal/change-password-modal.component';
import { ResetPasswordModalComponent } from './reset-password-modal/reset-password-modal.component';
import { ForgotPasswordModalComponent } from './forgot-password-modal/forgot-password-modal.component';
import { RenewSubscriptionModalComponent } from './renew-subscription-modal/renew-subscription-modal.component';
import { SearchPanelComponent } from './search-panel/search-panel.component';
import { SkeletonLoaderComponent } from './skeleton-loader/skeleton-loader.component';
import { UpdatePartnerFileModalComponent } from './update-partner-file-modal/update-partner-file-modal.component';
import { PartnerFormComponent } from './partner-form/partner-form.component';
import { RefreshButtonComponent } from './refresh-button/refresh-button.component';
import { RouterModule } from '@angular/router';
import { ClickablePhotoDirective } from './photo-lightbox/clickable-photo.directive';



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
    UpdateTrainerPhotoModalComponent,
    NewsletterPopupComponent,
    ValidationMessageComponent,
    LocationFormComponent,
    NotificationDetailsComponent,
    TimeAgoPipe,
    TodoDetailsModalComponent,
    UpdateEmailModalComponent,
    UpdateUserModalComponent,
    ChangePasswordModalComponent,
    ResetPasswordModalComponent,
    ForgotPasswordModalComponent,
    RenewSubscriptionModalComponent,
    SearchPanelComponent,
    SkeletonLoaderComponent,
    UpdatePartnerFileModalComponent,
    PartnerFormComponent,
    RefreshButtonComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FeatherModule,
    IconsModule,
    NgxExtendedPdfViewerModule,
    NgSelectModule,
    NgxMaskDirective,
    NgxMaskPipe,
    FormsModule,
    FeatherModule,
    FormsModule,
    RouterModule,
    StrapiUrlPipe,
    ClickablePhotoDirective
],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FeatherModule,
    NewsletterPopupComponent,
    ValidationMessageComponent,
    LocationFormComponent,
    NgSelectModule,
    NgxMaskDirective,
    NgxMaskPipe,
    TimeAgoPipe,
    StrapiUrlPipe,
    SearchPanelComponent,
    SkeletonLoaderComponent,
    UpdatePartnerFileModalComponent,
    RefreshButtonComponent,
    ClickablePhotoDirective,
  ],
  providers: [
    provideNgxMask(),
  ],
})
export class SharedModule { }
