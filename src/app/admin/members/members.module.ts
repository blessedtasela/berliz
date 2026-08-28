import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MembersComponent } from './members/members.component';
import { MembersListComponent } from './members-list/members-list.component';
import { MembersHeaderComponent } from './members-header/members-header.component';
import { AddMembersModalComponent } from './add-members-modal/add-members-modal.component';
import { UpdateMembersModalComponent } from './update-members-modal/update-members-modal.component';
import { MemberDetailsModalComponent } from './member-details-modal/member-details-modal.component';
import { MemberDetailPageComponent } from './member-detail-page/member-detail-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from 'src/app/icons/icons.module';
import { FooterModule } from 'src/app/footer/footer.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { AuthGuard } from 'src/app/services/auth.guard';
import { RoleGuard } from 'src/app/services/role.guard';



@NgModule({
  declarations: [
    MembersComponent,
    MembersListComponent,
    MembersHeaderComponent,
    AddMembersModalComponent,
    UpdateMembersModalComponent,
    MemberDetailsModalComponent,
    MemberDetailPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconsModule,
    FooterModule,
    NavbarModule,
    FormsModule,
    AdminSearchModule,
    RouterModule.forChild([
      { path: '', component: MembersComponent },
      { path: ':id', component: MemberDetailPageComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Member Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class MembersModule { }
