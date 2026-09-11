import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconsModule } from 'src/app/icons/icons.module';
import { AdminBerlizFeedbackComponent } from './admin-berliz-feedback/admin-berliz-feedback.component';

@NgModule({
  declarations: [
    AdminBerlizFeedbackComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    RouterModule.forChild([
      { path: '', component: AdminBerlizFeedbackComponent }
    ])
  ],
  providers: [
    DatePipe
  ]
})
export class BerlizFeedbackModule { }
