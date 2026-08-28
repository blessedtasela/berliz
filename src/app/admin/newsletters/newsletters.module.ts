import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { AddNewsletterModalComponent } from './add-newsletter-modal/add-newsletter-modal.component';
import { NewsletterBulkMessageModalComponent } from './newsletter-bulk-message-modal/newsletter-bulk-message-modal.component';
import { NewsletterHeaderComponent } from './newsletter-header/newsletter-header.component';
import { NewsletterListComponent } from './newsletter-list/newsletter-list.component';
import { NewslettersComponent } from './newsletters/newsletters.component';
import { NewsletterMessageModalComponent } from './newsletter-message-modal/newsletter-message-modal.component';
import { UpdateNewsletterModalComponent } from './update-newsletter-modal/update-newsletter-modal.component';
import { NewsletterDetailsModalComponent } from './newsletter-details-modal/newsletter-details-modal.component';
import { NewsletterDetailPageComponent } from './newsletter-detail-page/newsletter-detail-page.component';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { AuthGuard } from 'src/app/services/auth.guard';
import { RoleGuard } from 'src/app/services/role.guard';



@NgModule({
  declarations: [
    AddNewsletterModalComponent,
    NewsletterBulkMessageModalComponent,
    NewsletterHeaderComponent,
    NewsletterListComponent,
    NewslettersComponent,
    NewsletterMessageModalComponent,
    UpdateNewsletterModalComponent,
    NewsletterDetailsModalComponent,
    NewsletterDetailPageComponent
  ],

  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FooterModule,
    NavbarModule,
    AdminSearchModule,
    RouterModule.forChild([
      { path: '', component: NewslettersComponent },
      { path: ':id', component: NewsletterDetailPageComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Subscriber Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class NewslettersModule { }
