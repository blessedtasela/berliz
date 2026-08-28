import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from 'src/app/icons/icons.module';
import { AdminSearchComponent } from './admin-search.component';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';

@NgModule({
  declarations: [
    AdminSearchComponent
  ],
  imports: [
    ClickablePhotoDirective,
    CommonModule,
    FormsModule,
    IconsModule
  ],
  exports: [
    AdminSearchComponent
  ]
})
export class AdminSearchModule { }
