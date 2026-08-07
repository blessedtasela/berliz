import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqsPageComponent } from './faqs-page/faqs-page.component';
import { IconsModule } from '../icons/icons.module';



@NgModule({
  declarations: [
    FaqsPageComponent
  ],
  imports: [
    CommonModule,
    IconsModule
  ]
})
export class FaqsModule { }
