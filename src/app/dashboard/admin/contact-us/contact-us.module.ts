import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UpdateContactUsModalComponent } from './update-contact-us-modal/update-contact-us-modal.component';
import { AdminContactUsComponent } from './admin-contact-us/admin-contact-us.component';
import { AdminContactUsDetailsComponent } from './admin-contact-us-details/admin-contact-us-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { MatDialogModule } from '@angular/material/dialog';
import { NavbarModule } from 'src/app/navbar/navbar.module';



@NgModule({
  declarations: [
    UpdateContactUsModalComponent,
    AdminContactUsComponent,
    AdminContactUsDetailsComponent
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
