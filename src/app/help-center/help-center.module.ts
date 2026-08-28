import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconsModule } from 'src/app/icons/icons.module';
import { HelpCenterPageComponent } from './help-center-page/help-center-page.component';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';



@NgModule({
  declarations: [
    HelpCenterPageComponent
  ],
  imports: [
    ClickablePhotoDirective,
    CommonModule,
    RouterModule,
    IconsModule
  ]
})
export class HelpCenterModule { }
