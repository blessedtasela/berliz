import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PartnerOnepagerPageComponent } from './partner-onepager-page/partner-onepager-page.component';

@NgModule({
  declarations: [
    PartnerOnepagerPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: PartnerOnepagerPageComponent }
    ])
  ]
})
export class PartnerOnepagerModule { }
