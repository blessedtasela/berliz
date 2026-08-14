import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { IconsModule } from 'src/app/icons/icons.module';
import { AddCenterModalComponent } from './add-center-modal/add-center-modal.component';
import { CenterDetailsModalComponent } from './center-details-modal/center-details-modal.component';
import { CenterDetailPageComponent } from './center-detail-page/center-detail-page.component';
import { CenterHeaderComponent } from './center-header/center-header.component';
import { CenterListComponent } from './center-list/center-list.component';
import { CentersComponent } from './centers/centers.component';
import { UpdateCenterModalComponent } from './update-center-modal/update-center-modal.component';
import { FooterModule } from 'src/app/footer/footer.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { AuthGuard } from 'src/app/services/auth.guard';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';
import { ImageCropperModule } from 'ngx-image-cropper';



@NgModule({
  declarations:
    [
      AddCenterModalComponent,
      CenterDetailsModalComponent,
      CenterDetailPageComponent,
      CenterHeaderComponent,
      CenterListComponent,
      CentersComponent,
      UpdateCenterModalComponent
    ],

  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FooterModule,
    NavbarModule,
    AdminSearchModule,
    StrapiUrlPipe,
    ImageCropperModule,
    RouterModule.forChild([
      { path: '', component: CentersComponent },
      { path: ':id', component: CenterDetailPageComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Center Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class CentersModule { }
