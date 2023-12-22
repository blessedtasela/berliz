import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubTasksComponent } from './sub-tasks/sub-tasks.component';
import { SubTasksListComponent } from './sub-tasks-list/sub-tasks-list.component';
import { SubTasksHeaderComponent } from './sub-tasks-header/sub-tasks-header.component';
import { AddSubTasksModalComponent } from './add-sub-tasks-modal/add-sub-tasks-modal.component';
import { UpdateSubTasksModalComponent } from './update-sub-tasks-modal/update-sub-tasks-modal.component';
import { SubTaskDetailsModalComponent } from './sub-task-details-modal/sub-task-details-modal.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';



@NgModule({
  declarations: [
    SubTasksComponent,
    SubTasksListComponent,
    SubTasksHeaderComponent,
    AddSubTasksModalComponent,
    UpdateSubTasksModalComponent,
    SubTaskDetailsModalComponent
  ],
  imports: [
    CommonModule,
    FooterModule,
    NavbarModule,
    ReactiveFormsModule,
    FormsModule,
    IconsModule
  ]
})
export class SubTasksModule { }
