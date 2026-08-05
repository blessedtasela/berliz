import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesHeroComponent } from './categories-hero/categories-hero.component';
import { NavbarModule } from '../navbar/navbar.module';
import { FooterModule } from '../footer/footer.module';
import { IconsModule } from '../icons/icons.module';
import { CategoryDetailsComponent } from './category-details/category-details.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { CategoriesComponent } from './categories/categories.component';
import { CategoriesSearchComponent } from './categories-search/categories-search.component';
import { CategoriesSearchResultComponent } from './categories-search-result/categories-search-result.component';
import { CategoryTrainersComponent } from './category-trainers/category-trainers.component';
import { CategoryCentersComponent } from './category-centers/category-centers.component';
import { CategoryExercisesComponent } from './category-exercises/category-exercises.component';



@NgModule({
  declarations: [
    CategoriesHeroComponent,
    CategoryDetailsComponent,
    CategoriesComponent,
    CategoriesSearchComponent,
    CategoriesSearchResultComponent,
    CategoryTrainersComponent,
    CategoryCentersComponent,
    CategoryExercisesComponent
  ],
  imports: [
    CommonModule,
    NavbarModule,
    FooterModule,
    IconsModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule
  ],
  exports: [
  ]
})
export class CategoriesModule { }
