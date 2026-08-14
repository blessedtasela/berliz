import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { AddContactUsModalComponent } from './add-contact-us-modal/add-contact-us-modal.component';
import { AdminContactUsComponent } from './admin-contact-us/admin-contact-us.component';
import { ContactUsDetailsModalComponent } from './contact-us-details-modal/contact-us-details-modal.component';
import { ContactUsHeaderComponent } from './contact-us-header/contact-us-header.component';
import { ContactUsReviewModalComponent } from './contact-us-review-modal/contact-us-review-modal.component';
import { UpdateContactUsModalComponent } from './update-contact-us-modal/update-contact-us-modal.component';
import { ContactUsListComponent } from './contact-us-list/contact-us-list.component';
import { ContactUsDetailPageComponent } from './contact-us-detail-page/contact-us-detail-page.component';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { AuthGuard } from 'src/app/services/auth.guard';



@NgModule({
  declarations: [
    AddContactUsModalComponent,
    AdminContactUsComponent,
    ContactUsDetailsModalComponent,
    ContactUsDetailPageComponent,
    ContactUsHeaderComponent,
    ContactUsReviewModalComponent,
    UpdateContactUsModalComponent,
    ContactUsListComponent
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
      { path: '', component: AdminContactUsComponent },
      { path: ':id', component: ContactUsDetailPageComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Message Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class ContactUsModule { }
