import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TermsPageComponent } from './terms-page/terms-page.component';
import { IconsModule } from '../icons/icons.module';



@NgModule({
  declarations: [
    TermsPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    IconsModule
  ]
})
export class TermsModule { }
