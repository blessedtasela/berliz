import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconsModule } from 'src/app/icons/icons.module';
import { HelpCenterPageComponent } from './help-center-page/help-center-page.component';



@NgModule({
  declarations: [
    HelpCenterPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    IconsModule
  ]
})
export class HelpCenterModule { }
