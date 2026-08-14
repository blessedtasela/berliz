import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { AddTrainerModalComponent } from './add-trainer-modal/add-trainer-modal.component';
import { TrainerDetailsModalComponent } from './trainer-details-modal/trainer-details-modal.component';
import { TrainerDetailPageComponent } from './trainer-detail-page/trainer-detail-page.component';
import { TrainerHeaderComponent } from './trainer-header/trainer-header.component';
import { TrainerListComponent } from './trainer-list/trainer-list.component';
import { TrainersComponent } from './trainers/trainers.component';
import { UpdateTrainerModalComponent } from './update-trainer-modal/update-trainer-modal.component';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { AuthGuard } from 'src/app/services/auth.guard';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';
import { ImageCropperModule } from 'ngx-image-cropper';



@NgModule({
  declarations: [
    AddTrainerModalComponent,
    TrainerDetailsModalComponent,
    TrainerDetailPageComponent,
    TrainerHeaderComponent,
    TrainerListComponent,
    TrainersComponent,
    UpdateTrainerModalComponent,
  ],

  imports: [
    CommonModule,
    NavbarModule,
    FooterModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    AdminSearchModule,
    StrapiUrlPipe,
    ImageCropperModule,
    RouterModule.forChild([
      { path: '', component: TrainersComponent },
      { path: ':id', component: TrainerDetailPageComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Trainer Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class TrainersModule { }
