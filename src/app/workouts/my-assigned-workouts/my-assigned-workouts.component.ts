import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { Exercises } from 'src/app/models/exercise.interface';
import {
  WorkoutAssignmentResponse,
  WorkoutExerciseResponse,
} from 'src/app/models/workout.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';

import { loadActiveExercises } from 'src/app/state/exercise/exercise.actions';
import { selectActiveExercises } from 'src/app/state/exercise/exercise.selectors';
import {
  loadMyAssignedWorkouts,
  updateAssignmentStatus,
} from 'src/app/state/workout/workout.actions';
import {
  selectMyAssignedWorkouts,
  selectWorkoutLoading,
} from 'src/app/state/workout/workout.selector';

@Component({
  selector: 'app-my-assigned-workouts',
  templateUrl: './my-assigned-workouts.component.html'
})
export class MyAssignedWorkoutsComponent implements OnInit, OnDestroy {

  assignments: WorkoutAssignmentResponse[] = [];
  exercises: Exercises[] = [];

  expandedId: number | null = null;
  loading = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private snackbar: SnackBarService,
  ) { }

  ngOnInit(): void {
    // Every selected slice is paired with its load dispatch.
    this.store.dispatch(loadMyAssignedWorkouts());
    this.store.dispatch(loadActiveExercises());

    this.subscriptions.push(
      this.store.select(selectMyAssignedWorkouts).subscribe(a => this.assignments = a ?? []),
      this.store.select(selectActiveExercises).subscribe(e => this.exercises = e ?? []),
      this.store.select(selectWorkoutLoading).subscribe(l => this.loading = l),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // ── Grouping ──────────────────────────────────────────────────────────────

  get todo(): WorkoutAssignmentResponse[] {
    return this.assignments.filter(a => this.normalized(a.status) === 'ASSIGNED');
  }

  get inProgress(): WorkoutAssignmentResponse[] {
    return this.assignments.filter(a => this.normalized(a.status) === 'IN_PROGRESS');
  }

  get completed(): WorkoutAssignmentResponse[] {
    return this.assignments.filter(a => this.normalized(a.status) === 'COMPLETED');
  }

  normalized(status: string): string {
    return (status ?? '').toUpperCase();
  }

  // ── Display ───────────────────────────────────────────────────────────────

  sortedExercises(assignment: WorkoutAssignmentResponse): WorkoutExerciseResponse[] {
    return [...(assignment.workout?.exercises ?? [])]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  // Falls back to a client-side join if the backend didn't denormalise the name.
  exerciseName(row: WorkoutExerciseResponse): string {
    return row.exerciseName || this.exercises.find(e => e.id === row.exerciseId)?.name || 'Exercise';
  }

  statusClass(status: string): string {
    switch (this.normalized(status)) {
      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-100';
      case 'IN_PROGRESS': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  }

  statusLabel(status: string): string {
    switch (this.normalized(status)) {
      case 'COMPLETED': return 'Completed';
      case 'IN_PROGRESS': return 'In progress';
      case 'ASSIGNED': return 'Assigned';
      default: return status || 'Unknown';
    }
  }

  toggleExpanded(assignment: WorkoutAssignmentResponse): void {
    this.expandedId = this.expandedId === assignment.id ? null : assignment.id;
  }

  // ── Status toggle ─────────────────────────────────────────────────────────

  setStatus(assignment: WorkoutAssignmentResponse, status: string): void {
    if (this.normalized(assignment.status) === status) return;
    this.store.dispatch(updateAssignmentStatus({ id: assignment.id, status }));
    this.snackbar.openSnackBar(`Marked as ${this.statusLabel(status).toLowerCase()}`, '');
  }

  trackByAssignmentId(_: number, assignment: WorkoutAssignmentResponse): number {
    return assignment.id;
  }
}
