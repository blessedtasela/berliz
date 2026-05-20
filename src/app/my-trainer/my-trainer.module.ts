import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyTrainerMainComponent } from './my-trainer-main/my-trainer-main.component';
import { MyTrainerIntroductionComponent } from './my-trainer-introduction/my-trainer-introduction.component';
import { MyTrainerFeatureVideoComponent } from './my-trainer-feature-video/my-trainer-feature-video.component';
import { MyTrainerBenefitsComponent } from './my-trainer-benefits/my-trainer-benefits.component';
import { MyTrainerPricingComponent } from './my-trainer-pricing/my-trainer-pricing.component';
import { MyTrainerPhotoAlbumComponent } from './my-trainer-photo-album/my-trainer-photo-album.component';
import { MyTrainerVideoAlbumComponent } from './my-trainer-video-album/my-trainer-video-album.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from '../icons/icons.module';
import { FeatherModule } from 'angular-feather';
import { ImageCropperModule } from 'ngx-image-cropper';



@NgModule({
  declarations: [
    MyTrainerMainComponent,
    MyTrainerIntroductionComponent,
    MyTrainerFeatureVideoComponent,
    MyTrainerBenefitsComponent,
    MyTrainerPricingComponent,
    MyTrainerPhotoAlbumComponent,
    MyTrainerVideoAlbumComponent
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
