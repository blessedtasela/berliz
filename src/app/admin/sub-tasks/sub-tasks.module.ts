import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubTasksComponent } from './sub-tasks/sub-tasks.component';
import { SubTasksListComponent } from './sub-tasks-list/sub-tasks-list.component';
import { SubTasksHeaderComponent } from './sub-tasks-header/sub-tasks-header.component';
import { AddSubTasksModalComponent } from './add-sub-tasks-modal/add-sub-tasks-modal.component';
import { UpdateSubTasksModalComponent } from './update-sub-tasks-modal/update-sub-tasks-modal.component';
import { SubTaskDetailsModalComponent } from './sub-task-details-modal/sub-task-details-modal.component';



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
    CommonModule
  ]
})
export class SubTasksModule { }
