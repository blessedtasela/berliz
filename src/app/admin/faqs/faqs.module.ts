import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { FaqsComponent } from './faqs/faqs.component';
import { FaqsListComponent } from './faqs-list/faqs-list.component';
import { AddFaqModalComponent } from './add-faq-modal/add-faq-modal.component';
import { UpdateFaqModalComponent } from './update-faq-modal/update-faq-modal.component';

@NgModule({
  declarations: [
    FaqsComponent,
    FaqsListComponent,
    AddFaqModalComponent,
    UpdateFaqModalComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    NavbarModule,
    RouterModule.forChild([{ path: '', component: FaqsComponent }])
  ]
})
export class FaqsModule { }
