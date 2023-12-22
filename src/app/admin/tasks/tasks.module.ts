import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksComponent } from './tasks/tasks.component';
import { TasksListComponent } from './tasks-list/tasks-list.component';
import { TasksHeaderComponent } from './tasks-header/tasks-header.component';
import { TaskDetailsModalComponent } from './task-details-modal/task-details-modal.component';
import { AddTasksModalComponent } from './add-tasks-modal/add-tasks-modal.component';
import { UpdateTasksModalComponent } from './update-tasks-modal/update-tasks-modal.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';



@NgModule({
  declarations: [
    TasksComponent,
    TasksListComponent,
    TasksHeaderComponent,
    TaskDetailsModalComponent,
    AddTasksModalComponent,
    UpdateTasksModalComponent
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
export class TasksModule { }
