import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { AddCategoryModalComponent } from './add-category-modal/add-category-modal.component';
import { CategoriesHeaderComponent } from './categories-header/categories-header.component';
import { CategoriesListComponent } from './categories-list/categories-list.component';
import { CategoryComponent } from './category/category.component';
import { UpdateCategoryModalComponent } from './update-category-modal/update-category-modal.component';
import { CategoryDetailsModalComponent } from './category-details-modal/category-details-modal.component';

@NgModule({
  declarations: [
    AddCategoryModalComponent,
    CategoriesHeaderComponent,
    CategoriesListComponent,
    CategoryComponent,
    CategoryDetailsModalComponent,
    UpdateCategoryModalComponent
  ],

  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    NavbarModule
  ]
})
export class CategoriesModule { }
