import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainersPageComponent } from './trainers-page/trainers-page.component';
import { TrainersDetailsComponent } from './trainers-details/trainers-details.component';
import { TrainersHeroComponent } from './trainers-hero/trainers-hero.component';
import { NavbarModule } from '../navbar/navbar.module';
import { FooterModule } from '../footer/footer.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrainersSearchResultComponent } from './trainers-search-result/trainers-search-result.component';
import { TrainersSearchComponent } from './trainers-search/trainers-search.component';
import { RouterModule } from '@angular/router';
import { TrainerDetailHeroComponent } from './trainer-detail-hero/trainer-detail-hero.component';
import { TrainerCategoryComponent } from './trainer-category/trainer-category.component';
import { TrainerBenefitsComponent } from './trainer-benefits/trainer-benefits.component';
import { TrainerFeatureVideoComponent } from './trainer-feature-video/trainer-feature-video.component';
import { TrainerClientReviewComponent } from './trainer-client-review/trainer-client-review.component';
import { IconsModule } from '../icons/icons.module';
import { TrainerAlbumComponent } from './trainer-album/trainer-album.component';
import { ChatWithTrainerComponent } from './chat-with-trainer/chat-with-trainer.component';
import { ChatWithTrainerPopUpComponent } from './chat-with-trainer-pop-up/chat-with-trainer-pop-up.component';
import { TrainerLocationsComponent } from './trainer-locations/trainer-locations.component';
import { TrainerHeaderComponent } from './trainer-header/trainer-header.component';
import { TrainerPartnerFormComponent } from './trainer-partner-form/trainer-partner-form.component';
import { TrainersAlbumComponent } from './trainers-album/trainers-album.component';
import { TrainersBenefitsComponent } from './trainers-benefits/trainers-benefits.component';
import { TrainersCategoriesComponent } from './trainers-categories/trainers-categories.component';
import { TrainersClientReviewsComponent } from './trainers-client-reviews/trainers-client-reviews.component';
import { TrainersDetailsHeroComponent } from './trainers-details-hero/trainers-details-hero.component';
import { TrainersFeatureVideosComponent } from './trainers-feature-videos/trainers-feature-videos.component';
import { TrainersHeaderComponent } from './trainers-header/trainers-header.component';
import { TrainersIntroductionComponent } from './trainers-introduction/trainers-introduction.component';

@NgModule({
  declarations: [
    TrainersPageComponent,
    TrainersDetailsComponent,
    TrainersHeroComponent,
    TrainersSearchResultComponent,
    TrainersSearchComponent,
    TrainerDetailHeroComponent,
    TrainerCategoryComponent,
    TrainerBenefitsComponent,
    TrainerFeatureVideoComponent,
    TrainerClientReviewComponent,
    TrainerAlbumComponent,
    ChatWithTrainerComponent,
    ChatWithTrainerPopUpComponent,
    TrainerLocationsComponent,
    TrainerHeaderComponent,
    TrainerPartnerFormComponent,
    TrainersAlbumComponent,
    TrainersBenefitsComponent,
    TrainersCategoriesComponent,
    TrainersClientReviewsComponent,
    TrainersDetailsHeroComponent,
    TrainersFeatureVideosComponent,
    TrainersHeaderComponent,
    TrainersIntroductionComponent,
  ],
  imports: [
    CommonModule,
    NavbarModule,
    FooterModule,
    ReactiveFormsModule,
    RouterModule,
    IconsModule,
    FormsModule
  ]
})
export class TrainersModule { }
