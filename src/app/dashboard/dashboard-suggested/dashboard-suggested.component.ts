import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { Categories } from 'src/app/models/categories.interface';
import { Users } from 'src/app/models/users.interface';
import { WorkoutResponse } from 'src/app/models/workout.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { selectUser } from 'src/app/state/user/user.selector';
import {
  cloneWorkoutTemplate,
  cloneWorkoutTemplateFailure,
  cloneWorkoutTemplateSuccess,
  loadWorkoutTemplates
} from 'src/app/state/workout/workout.actions';
import { selectWorkoutTemplates } from 'src/app/state/workout/workout.selector';

/**
 * Dashboard discovery widget: suggested programs + suggested workouts.
 *
 * Programs: the existing `getActiveCategories` data sorted by `likes` — the most
 * popular services, no new backend call needed.
 *
 * Workouts: the existing public template list (`GET /workout/getTemplates`),
 * ranked by `cloneCount` DESC with `date` DESC breaking ties. The sort happens
 * here rather than in the named query so the ordering other template consumers
 * (my-workouts, service detail) already rely on stays untouched.
 *
 * "Quick add" reuses the `cloneWorkoutTemplate` action the Programs page uses —
 * same interaction, same success/failure feedback.
 */
@Component({
  selector: 'app-dashboard-suggested',
  templateUrl: './dashboard-suggested.component.html',
  styleUrls: ['./dashboard-suggested.component.css']
})
export class DashboardSuggestedComponent implements OnInit, OnDestroy {

  /** Top active categories by like count. */
  programs: Categories[] = [];
  /** Public workout templates, most-cloned first. */
  templates: WorkoutResponse[] = [];

  user!: Users | null;
  cloningTemplateId: number | null = null;

  private readonly programLimit = 4;
  private readonly templateLimit = 4;

  private subs: Subscription[] = [];

  constructor(
    private store: Store,
    private actions$: Actions,
    private router: Router,
    private dialog: MatDialog,
    private snackbar: SnackBarService
  ) { }

  ngOnInit(): void {
    this.store.dispatch(loadActiveCategories());
    this.store.dispatch(loadWorkoutTemplates());

    this.subs.push(
      this.store.select(selectUser).subscribe(user => this.user = user),

      this.store.select(selectActiveCategories).subscribe(list => {
        this.programs = [...(list ?? [])]
          .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
          .slice(0, this.programLimit);
      }),

      this.store.select(selectWorkoutTemplates).subscribe(list => {
        this.templates = [...(list ?? [])]
          .sort((a, b) =>
            (b.cloneCount ?? 0) - (a.cloneCount ?? 0) ||
            new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, this.templateLimit);
      }),

      this.actions$.pipe(ofType(cloneWorkoutTemplateSuccess)).subscribe(({ response }) => {
        this.cloningTemplateId = null;
        this.snackbar.openSnackBar(
          `"${response?.data?.name ?? 'Workout'}" added to your workouts`, '');
      }),

      this.actions$.pipe(ofType(cloneWorkoutTemplateFailure)).subscribe(({ error }) => {
        this.cloningTemplateId = null;
        this.snackbar.openSnackBar(error || 'Could not add this workout', 'error');
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ── Programs ────────────────────────────────────────────────────────────────

  formatStringToUrl(value: string): string {
    return (value ?? '').replace(/ /g, '-');
  }

  // ── Workout templates ───────────────────────────────────────────────────────

  templateExerciseNames(template: WorkoutResponse, limit = 3): string[] {
    return [...(template.exercises ?? [])]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .slice(0, limit)
      .map(x => x.exerciseName || 'Exercise');
  }

  extraTemplateExerciseCount(template: WorkoutResponse, limit = 3): number {
    return Math.max(0, (template.exercises ?? []).length - limit);
  }

  quickAddTemplate(template: WorkoutResponse): void {
    // Cloning writes a workout owned by the caller — same login gate as liking.
    if (!this.user?.email) {
      this.promptLogin('You need to be logged in to add a workout. Log in to continue?');
      return;
    }

    if (this.cloningTemplateId) { return; }
    this.cloningTemplateId = template.id;
    this.store.dispatch(cloneWorkoutTemplate({ id: template.id }));
  }

  private promptLogin(message: string): void {
    const ref = this.dialog.open(PromptModalComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Login required',
        message,
        confirmText: 'Log in',
        cancelText: 'Cancel',
        icon: 'log-in'
      }
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/login']);
      }
    });
  }

  trackById(_: number, item: { id: number }): number {
    return item.id;
  }
}
