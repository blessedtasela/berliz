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
// The Workouts tab on /dashboard/my-tasks renders <app-my-assigned-workouts>,
// which WorkoutsModule declares and exports. WorkoutsModule does not import
// MyTasksModule, so this is a one-way edge — no circular module dependency.
import { WorkoutsModule } from '../workouts/workouts.module';
import { SharedModule } from '../shared/shared.module';



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
    MatDialogModule,
    WorkoutsModule
  ]
})
export class MyTasksModule { }
