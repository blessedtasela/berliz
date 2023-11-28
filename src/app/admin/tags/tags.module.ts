import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { AddTagModalComponent } from './add-tag-modal/add-tag-modal.component';
import { TagDetailsModalComponent } from './tag-details-modal/tag-details-modal.component';
import { TagHeaderComponent } from './tag-header/tag-header.component';
import { TagListComponent } from './tag-list/tag-list.component';
import { TagsComponent } from './tags/tags.component';
import { UpdateTagModalComponent } from './update-tag-modal/update-tag-modal.component';



@NgModule({
  declarations: [
    AddTagModalComponent,
    TagDetailsModalComponent,
    TagHeaderComponent,
    TagListComponent,
    TagsComponent,
    UpdateTagModalComponent
  ],

  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FooterModule,
    NavbarModule
  ]
})
export class TagsModule { }
