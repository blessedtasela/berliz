import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { CategoryDetailPageComponent } from './category-detail-page/category-detail-page.component';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { AuthGuard } from 'src/app/services/auth.guard';
import { RoleGuard } from 'src/app/services/role.guard';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  declarations: [
    AddCategoryModalComponent,
    CategoriesHeaderComponent,
    CategoriesListComponent,
    CategoryComponent,
    CategoryDetailsModalComponent,
    CategoryDetailPageComponent,
    UpdateCategoryModalComponent,
  ],

  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    NavbarModule,
    AdminSearchModule,
    StrapiUrlPipe,
    ImageCropperModule,
    RouterModule.forChild([
      { path: '', component: CategoryComponent },
      { path: ':id', component: CategoryDetailPageComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Category Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class CategoriesModule { }
