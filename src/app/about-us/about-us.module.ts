import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutUsComponent } from './about-us/about-us.component';
import { AboutUsHeroComponent } from './about-us-hero/about-us-hero.component';
import { AboutUsIntroductionComponent } from './about-us-introduction/about-us-introduction.component';
import { AboutUsMissionComponent } from './about-us-mission/about-us-mission.component';
import { AboutUsVisionComponent } from './about-us-vision/about-us-vision.component';
import { NavbarModule } from '../navbar/navbar.module';
import { FooterModule } from '../footer/footer.module';
import { NewsAndUpdatesModule } from '../news-and-updates/news-and-updates.module';
import { CategoriesComponent } from './categories/categories.component';
import { RouterModule } from '@angular/router';
import { IconsModule } from '../icons/icons.module';
import { FactsComponent } from './facts/facts.component';



@NgModule({
  declarations: [
    AboutUsComponent,
    AboutUsHeroComponent,
    AboutUsIntroductionComponent,
    AboutUsMissionComponent,
    AboutUsVisionComponent,
    CategoriesComponent,
    FactsComponent,
  ],
  imports: [
    CommonModule,
    NavbarModule,
    FooterModule,
    RouterModule,
    IconsModule
  ]
})
export class AboutUsModule { }
