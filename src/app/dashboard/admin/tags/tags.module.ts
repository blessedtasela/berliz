import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TagComponent } from './tag/tag.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { TagDetailsComponent } from './tag-details/tag-details.component';
import { AddTagModalComponent } from './add-tag-modal/add-tag-modal.component';
import { UpdateTagModalComponent } from './update-tag-modal/update-tag-modal.component';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { TagHeaderComponent } from './tag-header/tag-header.component';
import { TagListComponent } from './tag-list/tag-list.component';



@NgModule({
  declarations: [
    TagComponent,
    TagDetailsComponent,
    AddTagModalComponent,
    UpdateTagModalComponent,
    TagHeaderComponent,
    TagListComponent
  ],
  imports: [
    CommonModule,
    NavbarModule,
    IconsModule,
    FooterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    DatePipe,
  ]
})
export class TagsModule { }
