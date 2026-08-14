import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { AddTagModalComponent } from './add-tag-modal/add-tag-modal.component';
import { TagDetailsModalComponent } from './tag-details-modal/tag-details-modal.component';
import { TagDetailPageComponent } from './tag-detail-page/tag-detail-page.component';
import { TagHeaderComponent } from './tag-header/tag-header.component';
import { TagListComponent } from './tag-list/tag-list.component';
import { TagsComponent } from './tags/tags.component';
import { UpdateTagModalComponent } from './update-tag-modal/update-tag-modal.component';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { AuthGuard } from 'src/app/services/auth.guard';



@NgModule({
  declarations: [
    AddTagModalComponent,
    TagDetailsModalComponent,
    TagDetailPageComponent,
    TagHeaderComponent,
    TagListComponent,
    TagsComponent,
    UpdateTagModalComponent,
  ],

  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FooterModule,
    NavbarModule,
    AdminSearchModule,
    RouterModule.forChild([
      { path: '', component: TagsComponent },
      { path: ':id', component: TagDetailPageComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Tag Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class TagsModule { }
