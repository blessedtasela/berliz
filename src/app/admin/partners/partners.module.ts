import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { AddPartnerModalComponent } from './add-partner-modal/add-partner-modal.component';
import { PartnerDetailsModalComponent } from './partner-details-modal/partner-details-modal.component';
import { PartnerDetailPageComponent } from './partner-detail-page/partner-detail-page.component';
import { PartnerHeaderComponent } from './partner-header/partner-header.component';
import { PartnerListComponent } from './partner-list/partner-list.component';
import { PartnersComponent } from './partners/partners.component';
import { UpdatePartnerModalComponent } from './update-partner-modal/update-partner-modal.component';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { AuthGuard } from 'src/app/services/auth.guard';
import { RoleGuard } from 'src/app/services/role.guard';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';

@NgModule({
  declarations: [
    AddPartnerModalComponent,
    PartnerDetailsModalComponent,
    PartnerDetailPageComponent,
    PartnerHeaderComponent,
    PartnerListComponent,
    PartnersComponent,
    UpdatePartnerModalComponent,
  ],

  imports: [
    ClickablePhotoDirective,
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FooterModule,
    NavbarModule,
    AdminSearchModule,
    RouterModule.forChild([
      { path: '', component: PartnersComponent },
      { path: ':id', component: PartnerDetailPageComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Partner Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class PartnersModule { }
