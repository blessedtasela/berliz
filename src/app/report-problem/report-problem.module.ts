import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconsModule } from 'src/app/icons/icons.module';
import { ReportProblemPageComponent } from './report-problem-page/report-problem-page.component';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';



@NgModule({
  declarations: [
    ReportProblemPageComponent
  ],
  imports: [
    ClickablePhotoDirective,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IconsModule
  ]
})
export class ReportProblemModule { }
