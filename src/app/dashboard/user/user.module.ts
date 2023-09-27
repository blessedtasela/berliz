import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LoginHeroComponent } from './login-hero/login-hero.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { SignupModalComponent } from './signup-modal/signup-modal.component';
import { ForgotPasswordModalComponent } from './forgot-password-modal/forgot-password-modal.component';
import { ResetPasswordModalComponent } from './reset-password-modal/reset-password-modal.component';
import { ChangePasswordModalComponent } from './change-password-modal/change-password-modal.component';
import { LoginPromptModalComponent } from './login-prompt-modal/login-prompt-modal.component'
import { AccountComponent } from './account/account.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { UpdateUserModalComponent } from './update-user-modal/update-user-modal.component';
import { AccountDetailsComponent } from './account-details/account-details.component';
import { UpdateProfilePhotoModalComponent } from './update-profile-photo-modal/update-profile-photo-modal.component';
import { FeatherModule } from 'angular-feather';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';

@NgModule({
  declarations: [
    LoginComponent,
    LoginHeroComponent,
    LoginFormComponent,
    SignupModalComponent,
    ForgotPasswordModalComponent,
    ResetPasswordModalComponent,
    ChangePasswordModalComponent,
    LoginPromptModalComponent,
    AccountComponent,
    ResetPasswordComponent,
    ActivateAccountComponent,
    UpdateUserModalComponent,
    AccountDetailsComponent,
    UpdateProfilePhotoModalComponent,
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
