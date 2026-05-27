import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyTrainerMainComponent } from './my-trainer-main/my-trainer-main.component';
import { MyTrainerIntroductionComponent } from './my-trainer-introduction/my-trainer-introduction.component';
import { MyTrainerBenefitsComponent } from './my-trainer-benefits/my-trainer-benefits.component';
import { MyTrainerPricingComponent } from './my-trainer-pricing/my-trainer-pricing.component';
import { MyTrainerPhotoAlbumComponent } from './my-trainer-photo-album/my-trainer-photo-album.component';
import { MyTrainerVideoAlbumComponent } from './my-trainer-video-album/my-trainer-video-album.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from '../icons/icons.module';
import { FeatherModule } from 'angular-feather';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MyTrainerFeatureVideosComponent } from './my-trainer-feature-videos/my-trainer-feature-videos.component';



@NgModule({
  declarations: [
    MyTrainerMainComponent,
    MyTrainerIntroductionComponent,
    MyTrainerBenefitsComponent,
    MyTrainerPricingComponent,
    MyTrainerPhotoAlbumComponent,
    MyTrainerVideoAlbumComponent,
    MyTrainerFeatureVideosComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IconsModule,
    FeatherModule,
    ImageCropperModule
  ]
})
export class MyTrainerModule { }
