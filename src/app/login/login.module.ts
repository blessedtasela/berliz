import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { LoginHeroComponent } from './login-hero/login-hero.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from '../icons/icons.module';



@NgModule({
  declarations: [
    LoginComponent,
    LoginFormComponent,
    LoginHeroComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconsModule
  ]
})
export class LoginModule { }
