import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerComponent } from './partner/partner.component';
import { CenterComponent } from './center/center.component';
import { CenterDataComponent } from './center-data/center-data.component';
import { PartnerNullComponent } from './partner-null/partner-null.component';
import { PartnerApplicationComponent } from './partner-application/partner-application.component';
import { PartnerDataComponent } from './partner-data/partner-data.component';
import { TrainerComponent } from './trainer/trainer.component';
import { TrainerDataComponent } from './trainer-data/trainer-data.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from '../icons/icons.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { RouterModule } from '@angular/router';
import { PartnerRouteComponent } from './partner-route/partner-route.component';
import { PartnerMainComponent } from './partner-main/partner-main.component';
import { SharedModule } from '../shared/shared.module';
import { CenterIntroductionComponent } from './center-introduction/center-introduction.component';
import { CenterPricingComponent } from './center-pricing/center-pricing.component';
import { CenterEquipmentComponent } from './center-equipment/center-equipment.component';
import { CenterLocationsComponent } from './center-locations/center-locations.component';
import { CenterAnnouncementsComponent } from './center-announcements/center-announcements.component';
import { CenterPhotoAlbumComponent } from './center-photo-album/center-photo-album.component';
import { CenterVideoAlbumComponent } from './center-video-album/center-video-album.component';
import { CenterTrainersComponent } from './center-trainers/center-trainers.component';
import { CenterReviewComponent } from './center-review/center-review.component';
import { CenterLikeComponent } from './center-like/center-like.component';
import { MyBookingsModule } from '../bookings/bookings.module';



@NgModule({
  declarations: [
    PartnerComponent,
    CenterComponent,
    CenterDataComponent,
    PartnerNullComponent,
    PartnerApplicationComponent,
    PartnerDataComponent,
    TrainerComponent,
    TrainerDataComponent,
    PartnerRouteComponent,
    PartnerMainComponent,
    CenterIntroductionComponent,
    CenterPricingComponent,
    CenterEquipmentComponent,
    CenterLocationsComponent,
    CenterAnnouncementsComponent,
    CenterPhotoAlbumComponent,
    CenterVideoAlbumComponent,
    CenterTrainersComponent,
    CenterReviewComponent,
    CenterLikeComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconsModule,
    ImageCropperModule,
    RouterModule,
    SharedModule,
    MyBookingsModule,
  ]
})
export class PartnerModule { }
