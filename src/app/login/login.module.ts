import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { LoginHeroComponent } from './login-hero/login-hero.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from '../icons/icons.module';
import { RouterModule } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { SignupModalComponent } from './signup-modal/signup-modal.component';
import { QuickSignupComponent } from './quick-signup/quick-signup.component';
import { NavbarBreadcrumbComponent } from '../navbar/navbar-breadcrumb/navbar-breadcrumb.component';
import { NavbarModule } from '../navbar/navbar.module';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    LoginComponent,
    LoginFormComponent,
    LoginHeroComponent,
    SignupComponent,
    SignupModalComponent,
    QuickSignupComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconsModule,
    RouterModule,
    NavbarModule,
    SharedModule
  ]
})
export class LoginModule { }
