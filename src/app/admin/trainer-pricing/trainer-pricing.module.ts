import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AddTrainerPricingModalComponent } from './add-trainer-pricing-modal/add-trainer-pricing-modal.component';
import { TrainerPricingDetailsModalComponent } from './trainer-pricing-details-modal/trainer-pricing-details-modal.component';
import { TrainerPricingDetailPageComponent } from './trainer-pricing-detail-page/trainer-pricing-detail-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { TrainerPricingComponent } from './trainer-pricing/trainer-pricing.component';
import { TrainerPricingListComponent } from './trainer-pricing-list/trainer-pricing-list.component';
import { TrainerPricingHeaderComponent } from './trainer-pricing-header/trainer-pricing-header.component';
import { UpdateTrainerPricingModalComponent } from './update-trainer-pricing-modal/update-trainer-pricing-modal.component';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { AuthGuard } from 'src/app/services/auth.guard';
import { RoleGuard } from 'src/app/services/role.guard';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';



@NgModule({
  declarations: [
    AddTrainerPricingModalComponent,
    TrainerPricingDetailsModalComponent,
    TrainerPricingDetailPageComponent,
    TrainerPricingComponent,
    TrainerPricingListComponent,
    TrainerPricingHeaderComponent,
    UpdateTrainerPricingModalComponent
  ],
  imports: [
    ClickablePhotoDirective,
    CommonModule,
    NavbarModule,
    FooterModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    AdminSearchModule,
    StrapiUrlPipe,
    RouterModule.forChild([
      { path: '', component: TrainerPricingComponent },
      { path: ':id', component: TrainerPricingDetailPageComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Trainer Pricing Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class TrainerPricingModule { }
