import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminNewsletterComponent } from './admin-newsletter/admin-newsletter.component';
import { UpdateNewsletterModalComponent } from './update-newsletter-modal/update-newsletter-modal.component';
import { FooterModule } from 'src/app/footer/footer.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { NewsletterListComponent } from './newsletter-list/newsletter-list.component';
import { NewsletterBulkMessageComponent } from './newsletter-bulk-message/newsletter-bulk-message.component';
import { NewsletterHeaderComponent } from './newsletter-header/newsletter-header.component';
import { NewsletterMessageComponent } from './newsletter-message/newsletter-message.component';
import { AddNewsletterComponent } from './add-newsletter/add-newsletter.component';



@NgModule({
  declarations: [
    AdminNewsletterComponent,
    UpdateNewsletterModalComponent,
    NewsletterListComponent,
    NewsletterBulkMessageComponent,
    NewsletterHeaderComponent,
    NewsletterMessageComponent,
    AddNewsletterComponent
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
