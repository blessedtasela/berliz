import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UpdateContactUsModalComponent } from './update-contact-us-modal/update-contact-us-modal.component';
import { AdminContactUsComponent } from './admin-contact-us/admin-contact-us.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { MatDialogModule } from '@angular/material/dialog';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { ContactUsListComponent } from './contact-us-list/contact-us-list.component';
import { ContactUsDetailsComponent } from './contact-us-details/contact-us-details.component';
import { ContactUsHeaderComponent } from './contact-us-header/contact-us-header.component';
import { AddContactUsModalComponent } from './add-contact-us-modal/add-contact-us-modal.component';
import { ContactUsReviewModalComponent } from './contact-us-review-modal/contact-us-review-modal.component';



@NgModule({
  declarations: [
    UpdateContactUsModalComponent,
    AdminContactUsComponent,
    ContactUsListComponent,
    ContactUsDetailsComponent,
    ContactUsHeaderComponent,
    AddContactUsModalComponent,
    ContactUsReviewModalComponent
  ],
  imports: [
    CommonModule,
    NavbarModule,
    IconsModule,
    FooterModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
  ],
  providers: [
    DatePipe,
  ]
})
export class ContactUsModule { }
