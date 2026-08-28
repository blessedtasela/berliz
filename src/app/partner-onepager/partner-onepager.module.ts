import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PartnerOnepagerPageComponent } from './partner-onepager-page/partner-onepager-page.component';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';

@NgModule({
  declarations: [
    PartnerOnepagerPageComponent
  ],
  imports: [
    ClickablePhotoDirective,
    CommonModule,
    RouterModule.forChild([
      { path: '', component: PartnerOnepagerPageComponent }
    ])
  ]
})
export class PartnerOnepagerModule { }
