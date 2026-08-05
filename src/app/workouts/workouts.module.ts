import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialogModule } from '@angular/material/dialog';
import { FeatherModule } from 'angular-feather';

import { IconsModule } from '../icons/icons.module';
import { WorkoutBuilderComponent } from './workout-builder/workout-builder.component';
import { MyWorkoutsComponent } from './my-workouts/my-workouts.component';
import { AssignWorkoutModalComponent } from './assign-workout-modal/assign-workout-modal.component';
import { MyAssignedWorkoutsComponent } from './my-assigned-workouts/my-assigned-workouts.component';

@NgModule({
  declarations: [
    WorkoutBuilderComponent,
    MyWorkoutsComponent,
    AssignWorkoutModalComponent,
    MyAssignedWorkoutsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    MatDialogModule,
    IconsModule,
    FeatherModule,
  ],
  exports: [
    WorkoutBuilderComponent,
    MyWorkoutsComponent,
    MyAssignedWorkoutsComponent,
  ]
})
export class WorkoutsModule { }
