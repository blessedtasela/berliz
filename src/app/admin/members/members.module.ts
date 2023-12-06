import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembersComponent } from './members/members.component';
import { MembersListComponent } from './members-list/members-list.component';
import { MembersHeaderComponent } from './members-header/members-header.component';
import { AddMembersModalComponent } from './add-members-modal/add-members-modal.component';
import { UpdateMembersModalComponent } from './update-members-modal/update-members-modal.component';
import { MemberDetailsModalComponent } from './member-details-modal/member-details-modal.component';



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
    CommonModule
  ]
})
export class MembersModule { }
