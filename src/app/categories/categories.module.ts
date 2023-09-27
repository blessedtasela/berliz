import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesHeroComponent } from './categories-hero/categories-hero.component';
import { CategoriesListComponent } from './categories-list/categories-list.component';
import { NavbarModule } from '../navbar/navbar.module';
import { FooterModule } from '../footer/footer.module';
import { IconsModule } from '../icons/icons.module';
import { CategoryDetailsComponent } from './category-details/category-details.component';
import { CategoryHeroDetailsComponent } from './category-hero-details/category-hero-details.component';
import { CategoryBenefitsComponent } from './category-benefits/category-benefits.component';
import { CategoryIntroductionComponent } from './category-introduction/category-introduction.component';
import { CategoryTagsComponent } from './category-tags/category-tags.component';
import { CategoryVoteComponent } from './category-vote/category-vote.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategoriesComponent } from './categories/categories.component';



@NgModule({
  declarations: [
    CategoriesHeroComponent,
    CategoriesListComponent,
    CategoryDetailsComponent,
    CategoryHeroDetailsComponent,
    CategoryBenefitsComponent,
    CategoryIntroductionComponent,
    CategoryTagsComponent,
    CategoryVoteComponent,
    CategoriesComponent
  ],
  imports: [
    CommonModule,
    NavbarModule,
    FooterModule,
    IconsModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    CategoriesListComponent
  ]
})
export class CategoriesModule { }
