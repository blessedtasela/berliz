import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { IconsModule } from 'src/app/icons/icons.module';
import { AdminProblemReportsComponent } from './admin-problem-reports/admin-problem-reports.component';

@NgModule({
  declarations: [
    AdminProblemReportsComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    MatDialogModule,
    RouterModule.forChild([
      { path: '', component: AdminProblemReportsComponent }
    ])
  ],
  providers: [
    DatePipe
  ]
})
export class ProblemReportsModule { }
