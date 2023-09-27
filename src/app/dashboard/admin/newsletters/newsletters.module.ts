import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminNewsletterComponent } from './admin-newsletter/admin-newsletter.component';
import { NewsletterDetailsComponent } from './newsletter-details/newsletter-details.component';
import { UpdateNewsletterModalComponent } from './update-newsletter-modal/update-newsletter-modal.component';
import { FooterModule } from 'src/app/footer/footer.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';



@NgModule({
  declarations: [
    AdminNewsletterComponent,
    NewsletterDetailsComponent,
    UpdateNewsletterModalComponent
  ],
  imports: [
    CommonModule,
    NavbarModule,
    IconsModule,
    FooterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class NewslettersModule { }
