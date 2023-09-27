import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '../icons/icons.module';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { HeaderComponent } from './header/header.component';
import { LogoComponent } from './logo/logo.component';
import { NavbarModule } from '../navbar/navbar.module';
import { FooterModule } from '../footer/footer.module';
import { HeroSectionComponent } from './hero-section/hero-section.component';
import { NewsAndUpdatesModule } from '../news-and-updates/news-and-updates.module';
import { OffersListComponent } from './offers-list/offers-list.component';
import { OffersComponent } from './offers/offers.component';
import { PromotionsComponent } from './promotions/promotions.component';
import { PromotionsListComponent } from './promotions-list/promotions-list.component';
import { RouterModule } from '@angular/router';
import { TestimonialComponent } from './testimonial/testimonial.component';


@NgModule({
  declarations: [
    LandingPageComponent,
    HeaderComponent,
    LogoComponent,
    HeroSectionComponent,
    OffersListComponent,
    OffersComponent,
    PromotionsComponent,
    PromotionsListComponent,
    TestimonialComponent
  ],
  imports: [
    CommonModule, 
    NavbarModule, 
    FooterModule,
    IconsModule,
    NewsAndUpdatesModule,
    RouterModule,
  ],
  exports: [
    LandingPageComponent
  ]
})
export class LandingPageModule { }
