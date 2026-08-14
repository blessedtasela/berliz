import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconsModule } from 'src/app/icons/icons.module';
import { ReportProblemPageComponent } from './report-problem-page/report-problem-page.component';



@NgModule({
  declarations: [
    ReportProblemPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IconsModule
  ]
})
export class ReportProblemModule { }
