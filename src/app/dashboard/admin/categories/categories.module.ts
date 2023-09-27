import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryComponent } from './category/category.component';
import { CategoryDetailsComponent } from './category-details/category-details.component';
import { AddCategoryModalComponent } from './add-category-modal/add-category-modal.component';
import { UpdateCategoryModalComponent } from './update-category-modal/update-category-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from 'src/app/icons/icons.module';
import { FooterModule } from 'src/app/footer/footer.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';



@NgModule({
  declarations: [
    CategoryComponent,
    CategoryDetailsComponent,
    AddCategoryModalComponent,
    UpdateCategoryModalComponent
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
