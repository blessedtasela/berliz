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
import { WhatsNewService } from 'src/app/services/whats-new.service';
import { LogWorkoutModalComponent } from '../log-workout-modal/log-workout-modal.component';
import { ExerciseProgressModalComponent } from '../exercise-progress-modal/exercise-progress-modal.component';
import { ShareWorkoutLogModalComponent } from '../share-workout-log-modal/share-workout-log-modal.component';

interface PersonalRecord {
  exerciseId: number;
  exerciseName: string;
  weight: number;
  weightUnit: string;
  logDate: string | Date;
}

/** kg -> lbs, used only to compare/aggregate mixed-unit sets fairly — never shown directly. */
const KG_TO_LBS = 2.20462;

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
    private whatsNew: WhatsNewService,
  ) { }

  ngOnInit(): void {
    this.whatsNew.markSeen('workout-history');
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

  // ── Stats (all computed client-side from the already-loaded logs — no
  //    extra round trip) ───────────────────────────────────────────────────

  get totalSessions(): number {
    return this.logs.length;
  }

  /**
   * Consecutive ISO weeks (Mon-Sun) with at least one session, counting back
   * from the current week. Deliberately weekly, not daily: this feature's
   * whole point is being forgiving of a flexible schedule (see the class
   * doc), so a rest day shouldn't zero out a streak the way a strict daily
   * counter would. The current week gets a grace period — if it has no
   * session YET, that alone doesn't break a real streak from prior weeks.
   */
  get weekStreak(): number {
    if (!this.logs.length) return 0;
    const weekKeys = new Set(this.logs.map(l => this.isoWeekKey(new Date(l.logDate))));

    const cursor = new Date();
    let streak = weekKeys.has(this.isoWeekKey(cursor)) ? 1 : 0;
    cursor.setDate(cursor.getDate() - 7);
    while (weekKeys.has(this.isoWeekKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 7);
    }
    return streak;
  }

  /** Total weight moved (reps × weight, summed across every set ever logged), normalized to lbs for a single comparable number. */
  get totalVolumeLbs(): number {
    let total = 0;
    for (const log of this.logs) {
      for (const ex of log.exercises ?? []) {
        for (const set of ex.sets ?? []) {
          if (set.weight == null || set.reps == null) continue;
          total += this.toLbs(set.weight, set.weightUnit) * set.reps;
        }
      }
    }
    return Math.round(total);
  }

  /** Heaviest set ever logged per catalog exercise — top 5 by weight, mixed units compared fairly via toLbs. */
  get personalRecords(): PersonalRecord[] {
    const bestByExercise = new Map<number, PersonalRecord & { normalizedWeight: number }>();

    for (const log of this.logs) {
      for (const ex of log.exercises ?? []) {
        if (ex.exerciseId == null) continue;
        for (const set of ex.sets ?? []) {
          if (set.weight == null) continue;
          const normalizedWeight = this.toLbs(set.weight, set.weightUnit);
          const existing = bestByExercise.get(ex.exerciseId);
          if (!existing || normalizedWeight > existing.normalizedWeight) {
            bestByExercise.set(ex.exerciseId, {
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              weight: set.weight,
              weightUnit: set.weightUnit || 'lbs',
              logDate: log.logDate,
              normalizedWeight,
            });
          }
        }
      }
    }

    return Array.from(bestByExercise.values())
      .sort((a, b) => b.normalizedWeight - a.normalizedWeight)
      .slice(0, 5);
  }

  private toLbs(weight: number, unit: string | null | undefined): number {
    return (unit || 'lbs').toLowerCase() === 'kg' ? weight * KG_TO_LBS : weight;
  }

  private isoWeekKey(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // Mon=1 .. Sun=7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Thursday of this ISO week
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
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

  viewProgress(exercise: { exerciseId: number | null; exerciseName: string }): void {
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

  trackByPRExerciseId(_: number, record: PersonalRecord): number {
    return record.exerciseId;
  }
}
