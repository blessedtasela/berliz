import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UpdateCenterPricingsModalComponent } from './update-center-pricings-modal/update-center-pricings-modal.component';
import { AddCenterPricingsModalComponent } from './add-center-pricings-modal/add-center-pricings-modal.component';
import { CenterPricingsDetailsModalComponent } from './center-pricings-details-modal/center-pricings-details-modal.component';
import { CenterPricingDetailPageComponent } from './center-pricing-detail-page/center-pricing-detail-page.component';
import { CenterPricingsListComponent } from './center-pricings-list/center-pricings-list.component';
import { CenterPricingsComponent } from './center-pricings/center-pricings.component';
import { CenterPricingsHeaderComponent } from './center-pricings-header/center-pricings-header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { AuthGuard } from 'src/app/services/auth.guard';
import { RoleGuard } from 'src/app/services/role.guard';



@NgModule({
  declarations: [
    UpdateCenterPricingsModalComponent,
    AddCenterPricingsModalComponent,
    CenterPricingsDetailsModalComponent,
    CenterPricingDetailPageComponent,
    CenterPricingsListComponent,
    CenterPricingsComponent,
    CenterPricingsHeaderComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    SharedModule,
    AdminSearchModule,
    RouterModule.forChild([
      { path: '', component: CenterPricingsComponent },
      { path: ':id', component: CenterPricingDetailPageComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Center Pricing Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class CenterPricingModule { }
