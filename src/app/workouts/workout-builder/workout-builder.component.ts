import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subscription } from 'rxjs';

import { Exercises } from 'src/app/models/exercise.interface';
import { WorkoutResponse } from 'src/app/models/workout.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';

import { loadActiveExercises } from 'src/app/state/exercise/exercise.actions';
import { selectActiveExercises } from 'src/app/state/exercise/exercise.selectors';
import {
  addWorkout,
  addWorkoutSuccess,
  clearSelectedWorkout,
  loadWorkout,
  updateWorkout,
  updateWorkoutSuccess,
} from 'src/app/state/workout/workout.actions';
import {
  selectSelectedWorkout,
  selectWorkoutError,
  selectWorkoutLoading,
} from 'src/app/state/workout/workout.selector';

@Component({
  selector: 'app-workout-builder',
  templateUrl: './workout-builder.component.html'
})
export class WorkoutBuilderComponent implements OnInit, OnDestroy {

  workoutForm!: FormGroup;

  // ── Left pane ─────────────────────────────────────────────────────────────
  allExercises: Exercises[] = [];
  filteredExercises: Exercises[] = [];
  searchTerm = '';

  // ── Edit mode ─────────────────────────────────────────────────────────────
  workoutId: number | null = null;
  private patchedWorkoutId: number | null = null;

  loading = false;
  error: string | null = null;
  invalidForm = false;
  saving = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private actions$: Actions,
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: SnackBarService,
  ) { }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.buildForm();

    // Left pane exercises — dispatch AND select (never select without dispatching)
    this.store.dispatch(loadActiveExercises());
    this.subscriptions.push(
      this.store.select(selectActiveExercises).subscribe(list => {
        this.allExercises = list ?? [];
        this.applyFilter();
      })
    );

    this.subscriptions.push(
      this.store.select(selectWorkoutLoading).subscribe(l => this.loading = l),
      this.store.select(selectWorkoutError).subscribe(e => this.error = e)
    );

    // Edit mode — the workout arrives asynchronously, so the form is patched
    // from the subscription (not once in ngOnInit).
    this.subscriptions.push(
      this.route.paramMap.subscribe(params => {
        const raw = params.get('id');
        const id = raw ? Number(raw) : null;
        this.workoutId = id && !isNaN(id) ? id : null;
        this.patchedWorkoutId = null;

        if (this.workoutId) {
          this.store.dispatch(loadWorkout({ id: this.workoutId }));
        } else {
          this.store.dispatch(clearSelectedWorkout());
          this.resetForm();
        }
      })
    );

    this.subscriptions.push(
      this.store.select(selectSelectedWorkout).subscribe(workout => {
        if (!workout || !this.workoutId) return;
        if (workout.id !== this.workoutId) return;
        if (this.patchedWorkoutId === workout.id) return;

        this.patchedWorkoutId = workout.id;
        this.patchFromWorkout(workout);
      })
    );

    // Navigate away only once the save actually succeeded
    this.subscriptions.push(
      this.actions$.pipe(ofType(addWorkoutSuccess, updateWorkoutSuccess)).subscribe(() => {
        this.saving = false;
        this.snackbar.openSnackBar(
          this.workoutId ? 'Workout updated' : 'Workout created', '');
        this.router.navigate(['/dashboard/workouts']);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.workoutForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', [Validators.maxLength(500)]],
      exercises: this.fb.array([]),
    });
  }

  get exercisesArray(): FormArray {
    return this.workoutForm.get('exercises') as FormArray;
  }

  private buildExerciseGroup(data: {
    exerciseId: number;
    exerciseName: string;
    position?: number;
    sets?: number;
    reps?: number;
    restSeconds?: number;
    notes?: string;
  }): FormGroup {
    return this.fb.group({
      exerciseId: [data.exerciseId, Validators.required],
      exerciseName: [data.exerciseName],
      position: [data.position ?? this.exercisesArray.length + 1],
      sets: [data.sets ?? 3, [Validators.required, Validators.min(1), Validators.max(50)]],
      reps: [data.reps ?? 10, [Validators.required, Validators.min(1), Validators.max(500)]],
      restSeconds: [data.restSeconds ?? 60, [Validators.required, Validators.min(0), Validators.max(3600)]],
      notes: [data.notes ?? '', Validators.maxLength(255)],
    });
  }

  private resetForm(): void {
    this.workoutForm.reset({ name: '', description: '' });
    this.exercisesArray.clear();
    this.invalidForm = false;
  }

  private patchFromWorkout(workout: WorkoutResponse): void {
    this.workoutForm.patchValue({
      name: workout.name ?? '',
      description: workout.description ?? '',
    });

    this.exercisesArray.clear();

    const rows = [...(workout.exercises ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    rows.forEach(row => {
      this.exercisesArray.push(this.buildExerciseGroup({
        exerciseId: row.exerciseId,
        exerciseName: row.exerciseName || this.exerciseNameFor(row.exerciseId),
        position: row.position,
        sets: row.sets,
        reps: row.reps,
        restSeconds: row.restSeconds,
        notes: row.notes,
      }));
    });

    this.syncPositions();
  }

  // ── Left pane search ──────────────────────────────────────────────────────

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredExercises = !term
      ? [...this.allExercises]
      : this.allExercises.filter(e =>
        (e.name ?? '').toLowerCase().includes(term) ||
        (e.muscleGroups ?? []).some(m => (m.name ?? '').toLowerCase().includes(term))
      );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  // The backend is expected to denormalise exerciseName. If it doesn't, this
  // client-side join against the Exercises store fills the gap.
  exerciseNameFor(exerciseId: number): string {
    return this.allExercises.find(e => e.id === exerciseId)?.name ?? 'Exercise';
  }

  muscleGroupsFor(exercise: Exercises): string {
    return (exercise.muscleGroups ?? []).map(m => m.name).join(' · ');
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────

  onDrop(event: CdkDragDrop<any>): void {
    if (event.previousContainer === event.container) {
      // Reorder within the workout
      moveItemInArray(this.exercisesArray.controls, event.previousIndex, event.currentIndex);
      this.exercisesArray.updateValueAndValidity();
    } else {
      // Dragged in from the available-exercises pane
      const exercise: Exercises = event.item.data;
      if (!exercise) return;
      this.exercisesArray.insert(
        event.currentIndex,
        this.buildExerciseGroup({ exerciseId: exercise.id, exerciseName: exercise.name })
      );
    }
    this.syncPositions();
  }

  addExercise(exercise: Exercises): void {
    this.exercisesArray.push(
      this.buildExerciseGroup({ exerciseId: exercise.id, exerciseName: exercise.name })
    );
    this.syncPositions();
  }

  removeExercise(index: number): void {
    this.exercisesArray.removeAt(index);
    this.syncPositions();
  }

  moveUp(index: number): void {
    if (index <= 0) return;
    moveItemInArray(this.exercisesArray.controls, index, index - 1);
    this.exercisesArray.updateValueAndValidity();
    this.syncPositions();
  }

  moveDown(index: number): void {
    if (index >= this.exercisesArray.length - 1) return;
    moveItemInArray(this.exercisesArray.controls, index, index + 1);
    this.exercisesArray.updateValueAndValidity();
    this.syncPositions();
  }

  private syncPositions(): void {
    this.exercisesArray.controls.forEach((ctrl, i) => {
      ctrl.get('position')?.setValue(i + 1, { emitEvent: false });
    });
  }

  rowGroup(index: number): FormGroup {
    return this.exercisesArray.at(index) as FormGroup;
  }

  rowName(index: number): string {
    const g = this.rowGroup(index);
    return g.get('exerciseName')?.value || this.exerciseNameFor(g.get('exerciseId')?.value);
  }

  rowInvalid(index: number): boolean {
    const g = this.rowGroup(index);
    return g.invalid && (g.touched || this.invalidForm);
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  get canSave(): boolean {
    return this.workoutForm.valid && this.exercisesArray.length > 0 && !this.saving;
  }

  save(): void {
    if (!this.workoutForm.valid || this.exercisesArray.length === 0) {
      this.invalidForm = true;
      this.workoutForm.markAllAsTouched();
      this.snackbar.openSnackBar(
        this.exercisesArray.length === 0
          ? 'Add at least one exercise to this workout'
          : 'Please fix the highlighted fields', 'error');
      return;
    }

    this.invalidForm = false;
    this.saving = true;

    const raw = this.workoutForm.getRawValue();
    const payload: any = {
      name: raw.name,
      description: raw.description ?? '',
      exercises: (raw.exercises ?? []).map((e: any, i: number) => ({
        exerciseId: Number(e.exerciseId),
        position: i + 1,
        sets: Number(e.sets),
        reps: Number(e.reps),
        restSeconds: Number(e.restSeconds),
        notes: e.notes ?? '',
      })),
    };

    if (this.workoutId) {
      payload.id = this.workoutId;
      this.store.dispatch(updateWorkout({ data: payload }));
    } else {
      this.store.dispatch(addWorkout({ data: payload }));
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/workouts']);
  }

  trackByExerciseId(_: number, exercise: Exercises): number {
    return exercise.id;
  }
}
