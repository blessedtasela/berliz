import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterModule } from 'src/app/footer/footer.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { IconsModule } from 'src/app/icons/icons.module';
import { AdminUpdateUserModalComponent } from './admin-update-user-modal/admin-update-user-modal.component';
import { AdminUpdateUserRoleModalComponent } from './admin-update-user-role-modal/admin-update-user-role-modal.component';
import { UserDetailsModalComponent } from './user-details-modal/user-details-modal.component';
import { UserHeaderComponent } from './user-header/user-header.component';
import { UserListComponent } from './user-list/user-list.component';
import { UsersComponent } from './users/users.component';
import { SearchUserComponent } from './search-user/search-user.component';
import { ImageCropperModule } from 'ngx-image-cropper';



@NgModule({
  declarations: [
    AdminUpdateUserModalComponent,
    AdminUpdateUserRoleModalComponent,
    UserDetailsModalComponent,
    UserHeaderComponent,
    UserListComponent,
    UsersComponent,
    SearchUserComponent
  ],

  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FooterModule,
    NavbarModule,
    ImageCropperModule
  ]
})
export class UsersModule { }
