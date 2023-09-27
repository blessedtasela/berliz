import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDetailsComponent } from './user-details/user-details.component';
import { IconsModule } from 'src/app/icons/icons.module';
import { FooterModule } from 'src/app/footer/footer.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UpdateUserRoleModalComponent } from './update-user-role-modal/update-user-role-modal.component';
import { AdminUpdateUserModalComponent } from './admin-update-user-modal/admin-update-user-modal.component';
import { AdminUpdateUserProfilePhotoModalComponent } from './admin-update-user-profile-photo-modal/admin-update-user-profile-photo-modal.component';
import { UserComponent } from './user/user.component';
import { UsersListComponent } from './users-list/users-list.component';
import { NavbarModule } from 'src/app/navbar/navbar.module';



@NgModule({
  declarations: [
    UserDetailsComponent,
    UpdateUserRoleModalComponent,
    AdminUpdateUserModalComponent,
    AdminUpdateUserProfilePhotoModalComponent,
    UserComponent,
    UsersListComponent
  ],
  imports: [
    CommonModule,
    NavbarModule,
    IconsModule,
    FooterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class UsersModule { }
