import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainerDetailsComponent } from './trainer-details/trainer-details.component';
import { TrainerBenefitsComponent } from './trainer-benefits/trainer-benefits.component';
import { TrainerFeatureVideosComponent } from './trainer-feature-videos/trainer-feature-videos.component';
import { TrainerLikeComponent } from './trainer-like/trainer-like.component';
import { TrainerPhotoAlbumComponent } from './trainer-photo-album/trainer-photo-album.component';
import { TrainerVideoAlbumComponent } from './trainer-video-album/trainer-video-album.component';
import { TrainerPricingComponent } from './trainer-pricing/trainer-pricing.component';
import { TrainerReviewComponent } from './trainer-review/trainer-review.component';
import { TrainerOutletComponent } from './trainer-outlet/trainer-outlet.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FooterModule } from '../footer/footer.module';
import { IconsModule } from '../icons/icons.module';
import { NavbarModule } from '../navbar/navbar.module';
import { TrainerIntroductionComponent } from './trainer-introduction/trainer-introduction.component';

@NgModule({
  declarations: [
    TrainerDetailsComponent,
    TrainerBenefitsComponent,
    TrainerFeatureVideosComponent,
    TrainerIntroductionComponent,
    TrainerLikeComponent,
    TrainerPhotoAlbumComponent,
    TrainerVideoAlbumComponent,
    TrainerPricingComponent,
    TrainerReviewComponent,
    TrainerOutletComponent
  ],
  imports: [
    CommonModule,
    NavbarModule,
    FooterModule,
    ReactiveFormsModule,
    RouterModule,
    IconsModule,
    FormsModule,
    ImageCropperModule
  ]
})
export class TrainerModule { }
