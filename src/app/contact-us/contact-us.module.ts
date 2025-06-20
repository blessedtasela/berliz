import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarModule } from '../navbar/navbar.module';
import { FooterModule } from '../footer/footer.module';
import { MatDialogModule } from '@angular/material/dialog';
import { ContactUsFormComponent } from './contact-us-form/contact-us-form.component';
import { ContactUsHeroComponent } from './contact-us-hero/contact-us-hero.component';
import { ContactUsPageComponent } from './contact-us-page/contact-us-page.component';
import { FeatherModule } from 'angular-feather';


@NgModule({
  declarations: [
    ContactUsFormComponent,
    ContactUsHeroComponent,
    ContactUsPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarModule,
    FooterModule,
    MatDialogModule,
    FeatherModule
  ]
})
export class ContactUsModule { }
