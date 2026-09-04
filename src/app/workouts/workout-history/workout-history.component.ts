import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { WorkoutLogExerciseResponse, WorkoutLogResponse } from 'src/app/models/workout.interface';
import { WorkoutService } from 'src/app/services/workout.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

import { AuthService } from 'src/app/services/auth.service';
import { LogWorkoutModalComponent } from '../log-workout-modal/log-workout-modal.component';
import { ExerciseProgressModalComponent } from '../exercise-progress-modal/exercise-progress-modal.component';
import { ShareWorkoutLogModalComponent } from '../share-workout-log-modal/share-workout-log-modal.component';

/**
 * Training HISTORY — `/dashboard/workouts/history`. What a user actually
 * did, day by day, as distinct from the Workout builder (plans) and
 * WorkoutAssignment (a trainer/self assignment's ASSIGNED/IN_PROGRESS/
 * COMPLETED status). Deliberately forgiving: entries don't need to follow
 * any plan or schedule, so a user who trains Mon/Tue/rest/Thu/Fri/rest/rest
 * — or skips a week entirely — never sees an error state here, just their
 * actual log.
 *
 * Standalone + direct service calls, same pattern as WorkoutDetailComponent:
 * a self-contained page with no other consumer of this data.
 */
@Component({
  selector: 'app-workout-history',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule, IconsModule, SharedModule],
  templateUrl: './workout-history.component.html',
})
export class WorkoutHistoryComponent implements OnInit {

  logs: WorkoutLogResponse[] = [];
  loading = false;

  constructor(
    private workoutService: WorkoutService,
    private dialog: MatDialog,
    private snackbar: SnackBarService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.workoutService.getMyWorkoutLogs()
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.logs = res?.data ?? [];
          this.loading = false;
        },
        error: () => {
          this.logs = [];
          this.loading = false;
        },
      });
  }

  // ── Display helpers ──────────────────────────────────────────────────────

  sortedExercises(log: WorkoutLogResponse): WorkoutLogExerciseResponse[] {
    return [...(log.exercises ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  setsSummary(exercise: WorkoutLogExerciseResponse): string {
    return (exercise.sets ?? [])
      .map(s => `${s.reps ?? '—'}×${s.weight ?? 0}${s.weightUnit ?? 'lbs'}${s.setType && s.setType !== 'NORMAL' ? ` (${s.setType.toLowerCase()})` : ''}`)
      .join(', ') || 'No sets recorded';
  }

  /** Exercises sharing a non-null supersetGroup with the one before them get a linking badge. */
  isSupersetContinuation(log: WorkoutLogResponse, exercise: WorkoutLogExerciseResponse): boolean {
    const list = this.sortedExercises(log);
    const index = list.indexOf(exercise);
    if (index <= 0 || exercise.supersetGroup == null) return false;
    return list[index - 1].supersetGroup === exercise.supersetGroup;
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  logWorkout(): void {
    const ref = this.dialog.open(LogWorkoutModalComponent, { width: '560px', maxWidth: '95vw' });
    ref.afterClosed().subscribe(saved => {
      if (saved) {
        this.snackbar.openSnackBar('Workout logged', '');
        this.refresh();
      }
    });
  }

  editLog(log: WorkoutLogResponse): void {
    const ref = this.dialog.open(LogWorkoutModalComponent, { width: '560px', maxWidth: '95vw', data: { log } });
    ref.afterClosed().subscribe(saved => {
      if (saved) {
        this.snackbar.openSnackBar('Session updated', '');
        this.refresh();
      }
    });
  }

  deleteLog(log: WorkoutLogResponse): void {
    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message: `delete this session${log.title ? ` ("${log.title}")` : ''}? This is irreversible.`,
        confirmation: true,
        disableClose: true,
      },
    });

    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.workoutService.deleteWorkoutLog(log.id).pipe(take(1)).subscribe(() => {
        this.snackbar.openSnackBar('Session deleted', '');
        this.refresh();
      });
      dialogRef.close();
    });
  }

  shareLog(log: WorkoutLogResponse): void {
    const ref = this.dialog.open(ShareWorkoutLogModalComponent, {
      width: '440px',
      maxWidth: '95vw',
      data: { log },
    });
    ref.afterClosed().subscribe((updated: WorkoutLogResponse | undefined) => {
      if (updated) this.logs = this.logs.map(l => l.id === updated.id ? updated : l);
    });
  }

  isOwnLog(log: WorkoutLogResponse): boolean {
    return log.userId === this.authService.getCurrentUserId();
  }

  /** "Logged by X" / "Last edited by Y" — only worth showing once more than one person can touch this entry. */
  attributionLabel(log: WorkoutLogResponse): string | null {
    if (!log.collaborators?.length) return null;
    if (log.lastEditedByUserId && log.lastEditedByUserId !== log.userId) {
      return `Last edited by ${log.lastEditedByName}`;
    }
    return `Logged by ${log.creatorName}`;
  }

  viewProgress(exercise: WorkoutLogExerciseResponse): void {
    if (exercise.exerciseId == null) return;
    this.dialog.open(ExerciseProgressModalComponent, {
      width: '440px',
      maxWidth: '95vw',
      data: { exerciseId: exercise.exerciseId, exerciseName: exercise.exerciseName },
    });
  }

  trackByLogId(_: number, log: WorkoutLogResponse): number {
    return log.id;
  }

  trackByExerciseId(_: number, exercise: WorkoutLogExerciseResponse): number {
    return exercise.id;
  }
}
