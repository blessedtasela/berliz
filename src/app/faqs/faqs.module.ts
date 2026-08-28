import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqsPageComponent } from './faqs-page/faqs-page.component';
import { IconsModule } from '../icons/icons.module';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';



@NgModule({
  declarations: [
    FaqsPageComponent
  ],
  imports: [
    ClickablePhotoDirective,
    CommonModule,
    IconsModule
  ]
})
export class FaqsModule { }
