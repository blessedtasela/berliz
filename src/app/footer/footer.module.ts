import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { IconsModule } from '../icons/icons.module';
import { SubFooterComponent } from './sub-footer/sub-footer.component';
import { RouterModule } from '@angular/router';
import { ScrollModule } from '../scroll/scroll.module';
import { FeatherModule } from 'angular-feather';
import { EmailComponent } from './email/email.component';
import { NewsletterComponent } from './newsletter/newsletter.component';
import { PhoneComponent } from './phone/phone.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SocialComponent } from './social/social.component';


@NgModule({
  declarations: [
    FooterComponent,
    SubFooterComponent,
    EmailComponent,
    NewsletterComponent,
    PhoneComponent,
    SocialComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    RouterModule,
    ScrollModule,
    FeatherModule,
    IconsModule,
    ReactiveFormsModule,
  ],
  exports: [
    FooterComponent
  ]
})
export class FooterModule { }
