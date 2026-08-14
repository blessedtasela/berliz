import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, take, takeUntil } from 'rxjs';
import { Exercises } from 'src/app/models/exercise.interface';
import { loadExercise } from 'src/app/state/exercise/exercise.actions';
import { selectExercises, selectSelectedExercise } from 'src/app/state/exercise/exercise.selectors';

/**
 * Routed detail page for a single exercise — `/dashboard/exercises/:id`
 * (also reachable via `/dashboard/hub/exercises/:id`, same lazy module).
 *
 * Replaces the old ExercisesDetailsModalComponent dialog. Checks the
 * already-loaded `exercises` list slice first (instant when navigating from
 * the list), and falls back to dispatching `loadExercise({ id })` — which
 * populates `selectedExercise` via a real backend fetch — for direct links
 * or refreshes.
 */
@Component({
  selector: 'app-exercise-detail-page',
  templateUrl: './exercise-detail-page.component.html',
  styleUrls: ['./exercise-detail-page.component.css']
})
export class ExerciseDetailPageComponent implements OnInit, OnDestroy {
  exerciseData: Exercises | null = null;
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = Number(params.get('id'));
        if (!id || Number.isNaN(id)) {
          this.loading = false;
          this.exerciseData = null;
          return;
        }
        this.loadExercise(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadExercise(id: number): void {
    this.loading = true;
    this.store.select(selectExercises)
      .pipe(take(1))
      .subscribe(exercises => {
        const found = (exercises || []).find(exercise => exercise.id === id);
        if (found) {
          this.exerciseData = found;
          this.loading = false;
        } else {
          this.store.dispatch(loadExercise({ id }));
          this.store.select(selectSelectedExercise)
            .pipe(takeUntil(this.destroy$))
            .subscribe(exercise => {
              this.exerciseData = exercise ?? null;
              this.loading = false;
            });
        }
      });
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  formatDate(dateString: any): any {
    if (!dateString) return '';
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
