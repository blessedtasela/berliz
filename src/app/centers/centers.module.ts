import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CenterPageComponent } from './center-page/center-page.component';
import { CenterHeroComponent } from './center-hero/center-hero.component';
import { CenterListComponent } from './center-list/center-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarModule } from '../navbar/navbar.module';
import { FooterModule } from '../footer/footer.module';
import { IconsModule } from '../icons/icons.module';
import { CenterSearchComponent } from './center-search/center-search.component';
import { CenterDetailComponent } from './center-detail/center-detail.component';
import { CenterSearchResultComponent } from './center-search-result/center-search-result.component';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ChatWithCenterComponent } from './chat-with-center/chat-with-center.component';
import { ChatWithCenterPopUpComponent } from './chat-with-center-pop-up/chat-with-center-pop-up.component';
import { CenterAlbumComponent } from './center-album/center-album.component';
import { CenterCategoriesComponent } from './center-categories/center-categories.component';
import { CenterPromotionsComponent } from './center-promotions/center-promotions.component';
import { CenterAnnouncementsComponent } from './center-announcements/center-announcements.component';
import { CenterReviewComponent } from './center-review/center-review.component';
import { CenterEquipmentsComponent } from './center-equipments/center-equipments.component';
import { CenterIntroductionComponent } from './center-introduction/center-introduction.component';
import { CenterVideoGalleryComponent } from './center-video-gallery/center-video-gallery.component';
import { CenterHeroDetailComponent } from './center-hero-detail/center-hero-detail.component';
import { CenterTrainersComponent } from './center-trainers/center-trainers.component';
import { CenterSubscriptionFormComponent } from './center-subscription-form/center-subscription-form.component';
import { CenterReviewFormComponent } from './center-review-form/center-review-form.component';
import { CenterLocationsComponent } from './center-locations/center-locations.component';

@NgModule({
  declarations: [
    CenterPageComponent,
    CenterHeroComponent,
    CenterListComponent,
    CenterSearchComponent,
    CenterDetailComponent,
    CenterSearchResultComponent,
    ChatWithCenterComponent,
    ChatWithCenterPopUpComponent,
    CenterAlbumComponent,
    CenterCategoriesComponent,
    CenterPromotionsComponent,
    CenterAnnouncementsComponent,
    CenterReviewComponent,
    CenterEquipmentsComponent,
    CenterIntroductionComponent,
    CenterVideoGalleryComponent,
    CenterHeroDetailComponent,
    CenterTrainersComponent,
    CenterSubscriptionFormComponent,
    CenterReviewFormComponent,
    CenterLocationsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarModule,
    FooterModule,
    IconsModule,
    BrowserModule,
    FormsModule,
    RouterModule
  ],
  providers: [
  ]
})
export class CentersModule { }
