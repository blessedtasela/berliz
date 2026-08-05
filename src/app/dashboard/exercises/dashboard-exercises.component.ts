import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { Categories } from 'src/app/models/categories.interface';
import { Exercises } from 'src/app/models/exercise.interface';
import { MuscleGroups } from 'src/app/models/muscle-groups.interface';

import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { loadActiveExercises } from 'src/app/state/exercise/exercise.actions';
import { selectActiveExercises } from 'src/app/state/exercise/exercise.selectors';
import { loadActiveMuscleGroups } from 'src/app/state/muscle-group/muscle-group.actions';
import { selectActiveMuscleGroups } from 'src/app/state/muscle-group/muscle-group.selectors';

/**
 * READ-ONLY exercise library for any signed-in user — `/dashboard/exercises`.
 *
 * Admin CRUD for exercises lives in `src/app/admin/exercises`; this page only
 * browses/searches the same `selectActiveExercises` store slice.
 */
@Component({
  selector: 'app-dashboard-exercises',
  templateUrl: './dashboard-exercises.component.html',
  styleUrls: ['./dashboard-exercises.component.css']
})
export class DashboardExercisesComponent implements OnInit, OnDestroy {

  exercises: Exercises[] = [];
  categories: Categories[] = [];
  muscleGroups: MuscleGroups[] = [];

  searchTerm = '';
  selectedCategoryId: number | null = null;
  selectedMuscleGroupId: number | null = null;

  /** id of the card whose demo clip is expanded */
  openDemoId: number | null = null;

  private subs: Subscription[] = [];

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(loadActiveExercises());
    this.store.dispatch(loadActiveCategories());
    this.store.dispatch(loadActiveMuscleGroups());

    this.subs.push(
      this.store.select(selectActiveExercises).subscribe(list => this.exercises = list ?? []),
      this.store.select(selectActiveCategories).subscribe(list => this.categories = list ?? []),
      this.store.select(selectActiveMuscleGroups).subscribe(list => this.muscleGroups = list ?? [])
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ── Filtering ───────────────────────────────────────────────────────────────

  get filteredExercises(): Exercises[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.exercises.filter(e => {
      const matchesTerm = !term
        || (e.name ?? '').toLowerCase().includes(term)
        || (e.description ?? '').toLowerCase().includes(term)
        || (e.muscleGroups ?? []).some(m => (m.name ?? '').toLowerCase().includes(term));

      const matchesCategory = this.selectedCategoryId === null
        || (e.categories ?? []).some(c => c.id === this.selectedCategoryId);

      const matchesMuscleGroup = this.selectedMuscleGroupId === null
        || (e.muscleGroups ?? []).some(m => m.id === this.selectedMuscleGroupId);

      return matchesTerm && matchesCategory && matchesMuscleGroup;
    });
  }

  get hasActiveFilters(): boolean {
    return !!this.searchTerm.trim()
      || this.selectedCategoryId !== null
      || this.selectedMuscleGroupId !== null;
  }

  selectCategory(id: number | null): void {
    this.selectedCategoryId = this.selectedCategoryId === id ? null : id;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = null;
    this.selectedMuscleGroupId = null;
  }

  // ── Display helpers ─────────────────────────────────────────────────────────

  toggleDemo(exercise: Exercises): void {
    this.openDemoId = this.openDemoId === exercise.id ? null : exercise.id;
  }

  muscleGroupsFor(exercise: Exercises): string {
    return (exercise?.muscleGroups ?? []).map(m => m.name).join(' · ');
  }

  trackByExerciseId(_index: number, exercise: Exercises): number {
    return exercise.id;
  }
}
