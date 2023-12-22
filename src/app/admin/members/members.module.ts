import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembersComponent } from './members/members.component';
import { MembersListComponent } from './members-list/members-list.component';
import { MembersHeaderComponent } from './members-header/members-header.component';
import { AddMembersModalComponent } from './add-members-modal/add-members-modal.component';
import { UpdateMembersModalComponent } from './update-members-modal/update-members-modal.component';
import { MemberDetailsModalComponent } from './member-details-modal/member-details-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from 'src/app/icons/icons.module';
import { FooterModule } from 'src/app/footer/footer.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';



@NgModule({
  declarations: [
    MembersComponent,
    MembersListComponent,
    MembersHeaderComponent,
    AddMembersModalComponent,
    UpdateMembersModalComponent,
    MemberDetailsModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconsModule,
    FooterModule,
    NavbarModule,
    FormsModule
  ]
})
export class MembersModule { }
