import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyTasksComponent } from './my-tasks/my-tasks.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterModule } from '../footer/footer.module';
import { IconsModule } from '../icons/icons.module';
import { NavbarModule } from '../navbar/navbar.module';
import { MyTasksPageComponent } from './my-tasks-page/my-tasks-page.component';
import { MatDialogModule } from '@angular/material/dialog';
import { AssignTaskModalComponent } from './assign-task-modal/assign-task-modal.component';



@NgModule({
  declarations: [
    MyTasksComponent,
    MyTasksPageComponent,
    AssignTaskModalComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    NavbarModule,
    FooterModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule
  ]
})
export class MyTasksModule { }
