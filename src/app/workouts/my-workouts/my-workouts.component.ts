import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subscription } from 'rxjs';

import { Exercises } from 'src/app/models/exercise.interface';
import {
  WorkoutAssignmentResponse,
  WorkoutResponse,
} from 'src/app/models/workout.interface';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

import { loadActiveExercises } from 'src/app/state/exercise/exercise.actions';
import { selectActiveExercises } from 'src/app/state/exercise/exercise.selectors';
import {
  cloneWorkoutTemplate,
  cloneWorkoutTemplateFailure,
  cloneWorkoutTemplateSuccess,
  deleteWorkout,
  loadAssignmentsIMade,
  loadMyWorkouts,
  loadWorkoutTemplates,
} from 'src/app/state/workout/workout.actions';
import {
  selectAssignmentsIMade,
  selectMyWorkouts,
  selectWorkoutLoading,
  selectWorkoutTemplates,
} from 'src/app/state/workout/workout.selector';

import { AssignWorkoutModalComponent } from '../assign-workout-modal/assign-workout-modal.component';

@Component({
  selector: 'app-my-workouts',
  templateUrl: './my-workouts.component.html'
})
export class MyWorkoutsComponent implements OnInit, OnDestroy {

  myWorkouts: WorkoutResponse[] = [];
  assignmentsIMade: WorkoutAssignmentResponse[] = [];
  exercises: Exercises[] = [];

  /** Admin-curated public templates — only fetched the first time the tab opens. */
  templates: WorkoutResponse[] = [];
  activeTab: 'mine' | 'templates' = 'mine';
  private templatesRequested = false;
  cloningTemplateId: number | null = null;

  searchTerm = '';
  loading = false;
  role: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private router: Router,
    private dialog: MatDialog,
    private actions$: Actions,
    private authService: AuthService,
    private snackbar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.role = (this.authService.getCurrentUserRole() ?? '').toLowerCase();

    // Every selected slice is paired with its load dispatch.
    this.refresh();

    this.subscriptions.push(
      this.store.select(selectMyWorkouts).subscribe(w => this.myWorkouts = w ?? []),
      this.store.select(selectActiveExercises).subscribe(e => this.exercises = e ?? []),
      this.store.select(selectWorkoutLoading).subscribe(l => this.loading = l),
      // Selected here, dispatched lazily by setTab() — the templates tab is the
      // only consumer, so there's no point fetching them on page load.
      this.store.select(selectWorkoutTemplates).subscribe(t => this.templates = t ?? []),
    );

    // A clone lands in myWorkouts via the reducer — bounce the user there so
    // they immediately see their new copy.
    this.subscriptions.push(
      this.actions$.pipe(ofType(cloneWorkoutTemplateSuccess)).subscribe(({ response }) => {
        this.cloningTemplateId = null;
        this.activeTab = 'mine';
        this.snackbar.openSnackBar(
          `"${response?.data?.name ?? 'Template'}" added to your workouts`, '');
      }),
      this.actions$.pipe(ofType(cloneWorkoutTemplateFailure)).subscribe(({ error }) => {
        this.cloningTemplateId = null;
        this.snackbar.openSnackBar(error || 'Could not add this template', 'error');
      }),
    );

    // Trainers also see what they've assigned out — dispatch + select together.
    if (this.isTrainer) {
      this.store.dispatch(loadAssignmentsIMade());
      this.subscriptions.push(
        this.store.select(selectAssignmentsIMade).subscribe(a => this.assignmentsIMade = a ?? [])
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // ── Role helpers ──────────────────────────────────────────────────────────

  get isTrainer(): boolean {
    return this.role === 'trainer';
  }

  get isCenter(): boolean {
    return this.role === 'center';
  }

  get canAssign(): boolean {
    // The backend currently rejects assignment from a center account.
    return !this.isCenter;
  }

  refresh(): void {
    this.store.dispatch(loadMyWorkouts());
    this.store.dispatch(loadActiveExercises());
    if (this.templatesRequested) this.store.dispatch(loadWorkoutTemplates());
    if (this.isTrainer) this.store.dispatch(loadAssignmentsIMade());
  }

  // ── Tabs / templates ──────────────────────────────────────────────────────

  setTab(tab: 'mine' | 'templates'): void {
    this.activeTab = tab;

    // Fetch once, on first activation — every selected slice stays paired with
    // its dispatch.
    if (tab === 'templates' && !this.templatesRequested) {
      this.templatesRequested = true;
      this.store.dispatch(loadWorkoutTemplates());
    }
  }

  get filteredTemplates(): WorkoutResponse[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.templates;
    return this.templates.filter(t =>
      (t.name ?? '').toLowerCase().includes(term) ||
      (t.description ?? '').toLowerCase().includes(term)
    );
  }

  /** Short chip list of the first few exercise names on a template card. */
  exerciseChips(workout: WorkoutResponse, limit = 4): string[] {
    return [...(workout.exercises ?? [])]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .slice(0, limit)
      .map(e => e.exerciseName || this.exercises.find(x => x.id === e.exerciseId)?.name || 'Exercise');
  }

  extraExerciseCount(workout: WorkoutResponse, limit = 4): number {
    return Math.max(0, (workout.exercises ?? []).length - limit);
  }

  quickAdd(template: WorkoutResponse): void {
    if (this.cloningTemplateId) return;
    this.cloningTemplateId = template.id;
    this.store.dispatch(cloneWorkoutTemplate({ id: template.id }));
  }

  // ── List ──────────────────────────────────────────────────────────────────

  get filteredWorkouts(): WorkoutResponse[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.myWorkouts;
    return this.myWorkouts.filter(w =>
      (w.name ?? '').toLowerCase().includes(term) ||
      (w.description ?? '').toLowerCase().includes(term)
    );
  }

  // Falls back to a client-side join if the backend didn't denormalise the name.
  exerciseNames(workout: WorkoutResponse): string {
    return [...(workout.exercises ?? [])]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map(e => e.exerciseName || this.exercises.find(x => x.id === e.exerciseId)?.name || 'Exercise')
      .join(' · ');
  }

  exerciseCount(workout: WorkoutResponse): number {
    return (workout.exercises ?? []).length;
  }

  assignmentsFor(workoutId: number): WorkoutAssignmentResponse[] {
    return this.assignmentsIMade.filter(a => a.workoutId === workoutId);
  }

  statusClass(status: string): string {
    switch ((status ?? '').toUpperCase()) {
      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-100';
      case 'IN_PROGRESS': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  }

  statusLabel(status: string): string {
    switch ((status ?? '').toUpperCase()) {
      case 'COMPLETED': return 'Completed';
      case 'IN_PROGRESS': return 'In progress';
      case 'ASSIGNED': return 'Assigned';
      default: return status || 'Unknown';
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  createWorkout(): void {
    this.router.navigate(['/dashboard/workouts/builder']);
  }

  editWorkout(workout: WorkoutResponse): void {
    this.router.navigate(['/dashboard/workouts/builder', workout.id]);
  }

  deleteWorkout(workout: WorkoutResponse): void {
    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message: `delete "${workout.name}"? This is irreversible.`,
        confirmation: true,
        disableClose: true
      }
    });

    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.store.dispatch(deleteWorkout({ id: workout.id }));
      this.snackbar.openSnackBar('Workout deleted', '');
      dialogRef.close();
    });

    this.subscriptions.push(sub);
  }

  assignWorkout(workout: WorkoutResponse): void {
    this.dialog.open(AssignWorkoutModalComponent, {
      width: '460px',
      maxWidth: '95vw',
      data: workout
    });
  }

  trackByWorkoutId(_: number, workout: WorkoutResponse): number {
    return workout.id;
  }
}
