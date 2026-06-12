import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { AddPartnerModalComponent } from './add-partner-modal/add-partner-modal.component';
import { PartnerDetailsModalComponent } from './partner-details-modal/partner-details-modal.component';
import { PartnerHeaderComponent } from './partner-header/partner-header.component';
import { PartnerListComponent } from './partner-list/partner-list.component';
import { PartnersComponent } from './partners/partners.component';
import { UpdatePartnerModalComponent } from './update-partner-modal/update-partner-modal.component';
import { SearchPartnerComponent } from './search-partner/search-partner.component';

@NgModule({
  declarations: [
    AddPartnerModalComponent,
    PartnerDetailsModalComponent,
    PartnerHeaderComponent,
    PartnerListComponent,
    PartnersComponent,
    UpdatePartnerModalComponent,
    SearchPartnerComponent
  ],

  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FooterModule,
    NavbarModule
  ]
})
export class PartnersModule { }
