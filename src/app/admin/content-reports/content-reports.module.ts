import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconsModule } from 'src/app/icons/icons.module';
import { AdminContentReportsComponent } from './admin-content-reports/admin-content-reports.component';

@NgModule({
  declarations: [
    AdminContentReportsComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    RouterModule.forChild([
      { path: '', component: AdminContentReportsComponent }
    ])
  ],
  providers: [
    DatePipe
  ]
})
export class ContentReportsModule { }
