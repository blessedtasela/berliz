import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsComponent } from './terms/terms.component';
import { LegalMainComponent } from './legal-main/legal-main.component';
import { LegalDetailsComponent } from './legal-details/legal-details.component';
import { IconsModule } from '../icons/icons.module';
import { FeatherModule } from 'angular-feather';



@NgModule({
  declarations: [
    TermsComponent,
    LegalMainComponent,
    LegalDetailsComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    FeatherModule
  ],
  exports:[
    LegalMainComponent
  ]
})
export class LegalModule { }
