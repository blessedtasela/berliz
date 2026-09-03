import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, take, takeUntil } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { Exercises } from 'src/app/models/exercise.interface';
import { loadExercise } from 'src/app/state/exercise/exercise.actions';
import { selectExercises, selectSelectedExercise } from 'src/app/state/exercise/exercise.selectors';

/**
 * Public exercise detail page — /dashboard/exercises/:id. Mirrors
 * WorkoutDetailComponent's pattern (standalone, lazy loadComponent route,
 * howToPerform split into a numbered list), but reads exercise state via
 * NgRx since that's how the rest of the exercise feature already works
 * (unlike Workout, which has no NgRx slice).
 */
@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule, SharedModule],
  templateUrl: './exercise-detail.component.html',
  styleUrls: ['./exercise-detail.component.css']
})
export class ExerciseDetailComponent implements OnInit, OnDestroy {
  exercise: Exercises | null = null;
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store: Store,
  ) { }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = Number(params.get('id'));
        if (!id || Number.isNaN(id)) {
          this.loading = false;
          this.exercise = null;
          return;
        }
        this.load(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private load(id: number): void {
    this.loading = true;
    this.store.select(selectExercises)
      .pipe(take(1))
      .subscribe(exercises => {
        const found = (exercises || []).find(e => e.id === id);
        if (found) {
          this.exercise = found;
          this.loading = false;
        } else {
          this.store.dispatch(loadExercise({ id }));
          this.store.select(selectSelectedExercise)
            .pipe(takeUntil(this.destroy$))
            .subscribe(exercise => {
              this.exercise = exercise ?? null;
              this.loading = false;
            });
        }
      });
  }

  /** howToPerform is one step per line — split client-side into a numbered list. */
  howToSteps(howToPerform: string | null | undefined): string[] {
    return (howToPerform ?? '').split('\n').map(s => s.trim()).filter(Boolean);
  }

  difficultyLabel(level: string | null | undefined): string {
    switch (level) {
      case 'BEGINNER': return 'Beginner';
      case 'INTERMEDIATE': return 'Intermediate';
      case 'ADVANCED': return 'Advanced';
      default: return '';
    }
  }

  difficultyClass(level: string | null | undefined): string {
    switch (level) {
      case 'BEGINNER': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INTERMEDIATE': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ADVANCED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  }
}
