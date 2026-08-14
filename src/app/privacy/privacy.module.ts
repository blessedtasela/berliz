import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrivacyPageComponent } from './privacy-page/privacy-page.component';
import { IconsModule } from '../icons/icons.module';



@NgModule({
  declarations: [
    PrivacyPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    IconsModule
  ]
})
export class PrivacyModule { }
