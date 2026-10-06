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
    imports: [CommonModule, RouterModule, IconsModule],
    templateUrl: './workout-room.component.html'
})
export class WorkoutRoomComponent implements OnInit {

  recentLogs: WorkoutLogResponse[] = [];
  templates: WorkoutResponse[] = [];
  loading = true;

  isProvider = false;

  /** Consecutive days (today or yesterday counts as "current") with at least one logged session. A same-day-tomorrow grace period isn't needed -- this is computed fresh on every page load, not decremented by a timer. */
  currentStreak = 0;
  longestStreak = 0;

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
        const logs = res?.data ?? [];
        this.recentLogs = [...logs]
          .sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime())
          .slice(0, 4);
        const streaks = this.computeStreaks(logs);
        this.currentStreak = streaks.current;
        this.longestStreak = streaks.longest;
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

  /**
   * Current streak = consecutive calendar days with a logged session, counting
   * backward from today -- allows yesterday as the most recent day so a
   * streak isn't shown as broken before the user has had a chance to log
   * today's session yet. Longest streak scans the full history the same way.
   * Pure day-granularity (not time-of-day), one log or five on the same day
   * count as a single day for streak purposes.
   */
  private computeStreaks(logs: WorkoutLogResponse[]): { current: number; longest: number } {
    if (logs.length === 0) return { current: 0, longest: 0 };

    const dayMs = 24 * 60 * 60 * 1000;
    const toDayKey = (d: string | Date) => {
      const date = new Date(d);
      return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const uniqueDays = Array.from(new Set(logs.map(l => toDayKey(l.logDate)))).sort((a, b) => b - a);

    const todayKey = toDayKey(new Date());
    let current = 0;
    if (uniqueDays.length > 0 && (uniqueDays[0] === todayKey || uniqueDays[0] === todayKey - dayMs)) {
      current = 1;
      for (let i = 1; i < uniqueDays.length; i++) {
        if (uniqueDays[i - 1] - uniqueDays[i] === dayMs) current++;
        else break;
      }
    }

    let longest = 1;
    let run = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      run = uniqueDays[i - 1] - uniqueDays[i] === dayMs ? run + 1 : 1;
      longest = Math.max(longest, run);
    }

    return { current, longest };
  }
}
