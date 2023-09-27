import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerApplicationComponent } from './partner-application/partner-application.component';
import { PartnerApplicationDetailsComponent } from './partner-application-details/partner-application-details.component';
import { IconsModule } from 'src/app/icons/icons.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { FooterModule } from 'src/app/footer/footer.module';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';



@NgModule({
  declarations: [
    PartnerApplicationComponent,
    PartnerApplicationDetailsComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    ReactiveFormsModule,
    NavbarModule,
    FooterModule,
    NgxExtendedPdfViewerModule
  ]
})
export class PartnerModule { }
