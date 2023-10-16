import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerComponent } from './partner/partner.component';
import { PartnerDetailsComponent } from './partner-details/partner-details.component';
import { PartnerListComponent } from './partner-list/partner-list.component';
import { UpdatePartnerModalComponent } from './update-partner-modal/update-partner-modal.component';
import { UpdatePartnerFileModalComponent } from './update-partner-file-modal/update-partner-file-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { AddPartnerModalComponent } from './add-partner-modal/add-partner-modal.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { FeatherModule } from 'angular-feather';
import { PartnerHeaderComponent } from './partner-header/partner-header.component';

@NgModule({
  declarations: [
    PartnerComponent,
    PartnerDetailsComponent,
    PartnerListComponent,
    UpdatePartnerModalComponent,
    UpdatePartnerFileModalComponent,
    AddPartnerModalComponent,
    PartnerHeaderComponent
  ],
  imports: [
    CommonModule,
    NavbarModule,
    IconsModule,
    FeatherModule,
    FooterModule,
    FormsModule,
    ReactiveFormsModule,
    NgxExtendedPdfViewerModule
  ]
})
export class PartnersModule { }
