import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryComponent } from './category/category.component';
import { AddCategoryModalComponent } from './add-category-modal/add-category-modal.component';
import { UpdateCategoryModalComponent } from './update-category-modal/update-category-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from 'src/app/icons/icons.module';
import { FooterModule } from 'src/app/footer/footer.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { CategoriesListComponent } from './categories-list/categories-list.component';
import { CategoriesHeaderComponent } from './categories-header/categories-header.component';
import { CategoryDetailsModalComponent } from './category-details-modal/category-details-modal.component';


@NgModule({
  declarations: [
    CategoryComponent,
    AddCategoryModalComponent,
    UpdateCategoryModalComponent,
    CategoriesListComponent,
    CategoriesHeaderComponent,
    CategoryDetailsModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NavbarModule,
    IconsModule,
    FooterModule
  ]
})
export class CategoriesModule { }
