import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlessedTaselaComponent } from './blessed-tasela/blessed-tasela.component';
import { IconsModule } from '../icons/icons.module';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    BlessedTaselaComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    RouterModule
  ]
})
export class PortfolioModule { }
