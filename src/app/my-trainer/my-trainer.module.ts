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
import { MyTrainerCentersComponent } from './my-trainer-centers/my-trainer-centers.component';
import { MyTrainerSubscriptionsComponent } from './my-trainer-subscriptions/my-trainer-subscriptions.component';
import { MyTrainerClientsComponent } from './my-trainer-clients/my-trainer-clients.component';
import { MyTrainerReviewComponent } from './my-trainer-review/my-trainer-review.component';
import { MyTrainerLikeComponent } from './my-trainer-like/my-trainer-like.component';
import { MyTrainerTestimonialsComponent } from './my-trainer-testimonials/my-trainer-testimonials.component';
import { NgxFileDropModule } from 'ngx-file-drop';
import { RouterModule } from '@angular/router';
import { FooterModule } from '../footer/footer.module';
import { NavbarModule } from '../navbar/navbar.module';
import { MyTrainerSubModalComponent } from './my-trainer-sub-modal/my-trainer-sub-modal.component';
import { StrapiUrlPipe } from '../shared/pipes/strapi-url.pipe';
import { MyTrainerSharedProgressComponent } from './my-trainer-shared-progress/my-trainer-shared-progress.component';
import { MyEquipmentPageComponent } from '../my-equipment/my-equipment-page/my-equipment-page.component';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';



@NgModule({
  declarations: [
    MyTrainerMainComponent,
    MyTrainerIntroductionComponent,
    MyTrainerBenefitsComponent,
    MyTrainerPricingComponent,
    MyTrainerPhotoAlbumComponent,
    MyTrainerVideoAlbumComponent,
    MyTrainerFeatureVideosComponent,
    MyTrainerCentersComponent,
    MyTrainerSubscriptionsComponent,
    MyTrainerClientsComponent,
    MyTrainerReviewComponent,
    MyTrainerLikeComponent,
    MyTrainerTestimonialsComponent,
    MyTrainerSubModalComponent,
    MyTrainerSharedProgressComponent
  ],
  imports: [
    ClickablePhotoDirective,
    CommonModule,
    NavbarModule,
    FooterModule,
    ReactiveFormsModule,
    RouterModule,
    IconsModule,
    FormsModule,
    ImageCropperModule,
    NgxFileDropModule,
    StrapiUrlPipe,
    MyEquipmentPageComponent,
  ]
})
export class MyTrainerModule { }
