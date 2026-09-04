import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription, take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { Exercises } from 'src/app/models/exercise.interface';
import {
  SetType,
  WeightUnit,
  WorkoutLogExerciseRequest,
  WorkoutLogRequest,
  WorkoutLogResponse,
} from 'src/app/models/workout.interface';
import { WorkoutService } from 'src/app/services/workout.service';
import { loadActiveExercises } from 'src/app/state/exercise/exercise.actions';
import { selectActiveExercises } from 'src/app/state/exercise/exercise.selectors';

interface EditableSet {
  reps: number | null;
  weight: number | null;
  weightUnit: WeightUnit;
  setType: SetType;
  restSeconds: number | null;
}

interface EditableExercise {
  mode: 'catalog' | 'custom';
  exerciseId: number | null;
  customExerciseName: string;
  supersetGroup: number | null;
  notes: string;
  sets: EditableSet[];
}

export const SET_TYPES: { value: SetType; label: string }[] = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'WARMUP', label: 'Warm-up' },
  { value: 'DROPSET', label: 'Drop set' },
  { value: 'FAILURE', label: 'To failure' },
  { value: 'AMRAP', label: 'AMRAP' },
];

/**
 * Add/edit a training-history entry — deliberately loose validation (only a
 * date and at least one exercise are required) so a user can log a partial,
 * out-of-plan, or ad-hoc session without fighting the form. Plain array-
 * driven state rather than a FormArray: the nesting (exercises -> sets) is
 * shallow and every field is either a number or a short string, so reactive
 * forms would add ceremony without buying validation we actually need.
 */
@Component({
  selector: 'app-log-workout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, IconsModule],
  templateUrl: './log-workout-modal.component.html',
})
export class LogWorkoutModalComponent implements OnInit, OnDestroy {

  readonly setTypes = SET_TYPES;

  title = '';
  logDate: string = this.today();
  notes = '';
  durationMinutes: number | null = null;
  exercises: EditableExercise[] = [];

  catalogExercises: Exercises[] = [];
  submitting = false;
  error: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { log?: WorkoutLogResponse },
    public dialogRef: MatDialogRef<LogWorkoutModalComponent>,
    private store: Store,
    private workoutService: WorkoutService,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(loadActiveExercises());
    this.subscriptions.push(
      this.store.select(selectActiveExercises).subscribe(e => this.catalogExercises = e ?? [])
    );

    if (this.data?.log) this.loadFromLog(this.data.log);
    if (this.exercises.length === 0) this.addExercise();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  get isEdit(): boolean {
    return !!this.data?.log?.id;
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private loadFromLog(log: WorkoutLogResponse): void {
    this.title = log.title ?? '';
    this.logDate = log.logDate ? new Date(log.logDate).toISOString().slice(0, 10) : this.today();
    this.notes = log.notes ?? '';
    this.durationMinutes = log.durationMinutes ?? null;
    this.exercises = (log.exercises ?? []).map(ex => ({
      mode: ex.exerciseId != null ? 'catalog' : 'custom',
      exerciseId: ex.exerciseId,
      customExerciseName: ex.exerciseId == null ? (ex.exerciseName ?? '') : '',
      supersetGroup: ex.supersetGroup ?? null,
      notes: ex.notes ?? '',
      sets: (ex.sets ?? []).map(s => ({
        reps: s.reps,
        weight: s.weight,
        weightUnit: (s.weightUnit as WeightUnit) ?? 'lbs',
        setType: (s.setType as SetType) ?? 'NORMAL',
        restSeconds: s.restSeconds,
      })),
    }));
  }

  // ── Exercises ────────────────────────────────────────────────────────────

  addExercise(): void {
    this.exercises.push({
      mode: 'catalog',
      exerciseId: null,
      customExerciseName: '',
      supersetGroup: null,
      notes: '',
      sets: [this.newSet()],
    });
  }

  removeExercise(index: number): void {
    this.exercises.splice(index, 1);
  }

  setExerciseMode(index: number, mode: 'catalog' | 'custom'): void {
    const ex = this.exercises[index];
    ex.mode = mode;
    if (mode === 'catalog') ex.customExerciseName = '';
    else ex.exerciseId = null;
  }

  isSupersetChecked(index: number): boolean {
    if (index === 0) return false;
    const ex = this.exercises[index];
    const prev = this.exercises[index - 1];
    return ex.supersetGroup != null && ex.supersetGroup === prev.supersetGroup;
  }

  toggleSuperset(index: number, checked: boolean): void {
    if (index === 0) return;
    const ex = this.exercises[index];
    const prev = this.exercises[index - 1];
    if (checked) {
      if (prev.supersetGroup == null) prev.supersetGroup = this.nextSupersetGroup();
      ex.supersetGroup = prev.supersetGroup;
    } else {
      ex.supersetGroup = null;
    }
  }

  private nextSupersetGroup(): number {
    const used = this.exercises.map(e => e.supersetGroup).filter((g): g is number => g != null);
    return used.length ? Math.max(...used) + 1 : 1;
  }

  // ── Sets ─────────────────────────────────────────────────────────────────

  private newSet(): EditableSet {
    const previous = this.exercises.length
      ? this.exercises[this.exercises.length - 1].sets.slice(-1)[0]
      : undefined;
    return {
      reps: previous?.reps ?? null,
      weight: previous?.weight ?? null,
      weightUnit: previous?.weightUnit ?? 'lbs',
      setType: 'NORMAL',
      restSeconds: previous?.restSeconds ?? null,
    };
  }

  addSet(exerciseIndex: number): void {
    const ex = this.exercises[exerciseIndex];
    const last = ex.sets[ex.sets.length - 1];
    ex.sets.push({
      reps: last?.reps ?? null,
      weight: last?.weight ?? null,
      weightUnit: last?.weightUnit ?? 'lbs',
      setType: 'NORMAL',
      restSeconds: last?.restSeconds ?? null,
    });
  }

  removeSet(exerciseIndex: number, setIndex: number): void {
    this.exercises[exerciseIndex].sets.splice(setIndex, 1);
  }

  trackByIndex(i: number): number {
    return i;
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  get canSubmit(): boolean {
    if (this.submitting || !this.logDate || this.exercises.length === 0) return false;
    return this.exercises.every(ex =>
      ex.mode === 'catalog' ? ex.exerciseId != null : ex.customExerciseName.trim().length > 0);
  }

  save(): void {
    if (!this.canSubmit) {
      this.error = 'Give every exercise a name (pick one, or type a custom one) and set a date.';
      return;
    }

    this.error = null;
    this.submitting = true;

    const request: WorkoutLogRequest = {
      id: this.data?.log?.id,
      title: this.title.trim() || null,
      logDate: this.logDate,
      notes: this.notes.trim() || null,
      durationMinutes: this.durationMinutes,
      exercises: this.exercises.map((ex, i): WorkoutLogExerciseRequest => ({
        exerciseId: ex.mode === 'catalog' ? ex.exerciseId : null,
        customExerciseName: ex.mode === 'custom' ? ex.customExerciseName.trim() : null,
        position: i + 1,
        supersetGroup: ex.supersetGroup,
        notes: ex.notes.trim() || null,
        sets: ex.sets.map((s, j) => ({
          setNumber: j + 1,
          reps: s.reps,
          weight: s.weight,
          weightUnit: s.weightUnit,
          setType: s.setType,
          restSeconds: s.restSeconds,
        })),
      })),
    };

    const request$ = this.isEdit
      ? this.workoutService.updateWorkoutLog(request)
      : this.workoutService.addWorkoutLog(request);

    request$.pipe(take(1)).subscribe({
      next: () => {
        this.submitting = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.message || 'Could not save this session. Please try again.';
      },
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
