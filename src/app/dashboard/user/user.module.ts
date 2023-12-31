import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ForgotPasswordModalComponent } from './forgot-password-modal/forgot-password-modal.component';
import { ResetPasswordModalComponent } from './reset-password-modal/reset-password-modal.component';
import { ChangePasswordModalComponent } from './change-password-modal/change-password-modal.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { UpdateUserModalComponent } from './update-user-modal/update-user-modal.component';
import { UpdateProfilePhotoModalComponent } from './update-profile-photo-modal/update-profile-photo-modal.component';
import { FeatherModule } from 'angular-feather';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { ProfileComponent } from './profile/profile.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';

@NgModule({
  declarations: [
    ForgotPasswordModalComponent,
    ResetPasswordModalComponent,
    ChangePasswordModalComponent,
    ResetPasswordComponent,
    ActivateAccountComponent,
    UpdateUserModalComponent,
    UpdateProfilePhotoModalComponent,
    ProfileComponent,
    ProfileSettingsComponent,
    ProfilePageComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FeatherModule,
    FooterModule,
    IconsModule,
    NavbarModule,
  ],
  providers: [
  ],

})
export class UserModule { }
