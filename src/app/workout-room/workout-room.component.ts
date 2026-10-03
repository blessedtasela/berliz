import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { WorkoutLogResponse, WorkoutResponse } from 'src/app/models/workout.interface';
import { WorkoutService } from 'src/app/services/workout.service';
import { selectUser } from 'src/app/state/user/user.selector';

/**
 * One landing page for every workout-adjacent tool instead of them being
 * scattered across the sidebar -- Workouts, Exercises, Runs, Progress,
 * Tasks, To-do list and Messages all already exist as their own full
 * features; this aggregates them (quick links + a glance at recent
 * activity) rather than re-implementing any of them.
 */
@Component({
  selector: 'app-workout-room',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  templateUrl: './workout-room.component.html',
})
export class WorkoutRoomComponent implements OnInit {

  recentLogs: WorkoutLogResponse[] = [];
  templates: WorkoutResponse[] = [];
  loading = true;

  isProvider = false;

  constructor(
    private workoutService: WorkoutService,
    private store: Store,
  ) { }

  ngOnInit(): void {
    this.store.select(selectUser).pipe(take(1)).subscribe(user => {
      const role = user?.role?.toLowerCase();
      this.isProvider = role === 'trainer' || role === 'center';
    });

    this.loading = true;
    this.workoutService.getMyWorkoutLogs().pipe(take(1)).subscribe({
      next: res => {
        this.recentLogs = [...(res?.data ?? [])]
          .sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime())
          .slice(0, 4);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });

    this.workoutService.getTemplates().pipe(take(1)).subscribe({
      next: res => { this.templates = res?.data ?? []; },
      error: () => { },
    });
  }

  logLabel(log: WorkoutLogResponse): string {
    return log.title || log.workoutName || 'Workout session';
  }
}
