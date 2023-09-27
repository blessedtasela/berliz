import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollToTopComponent } from './scroll-to-top/scroll-to-top.component';
import { IconsModule } from '../icons/icons.module';



@NgModule({
  declarations: [
    ScrollToTopComponent
  ],
  imports: [
    CommonModule,
    IconsModule
  ],
  exports: [
    ScrollToTopComponent
  ]
})
export class ScrollModule { }
