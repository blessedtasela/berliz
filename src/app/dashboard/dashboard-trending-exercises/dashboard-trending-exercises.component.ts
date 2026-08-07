import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { Categories } from 'src/app/models/categories.interface';
import { Exercises } from 'src/app/models/exercise.interface';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import {
  likeExercise,
  loadMyExerciseLikes,
  loadTrendingExercises
} from 'src/app/state/exercise/exercise.actions';
import {
  selectLikedExerciseIds,
  selectTrendingCategoryId,
  selectTrendingExercises,
  selectTrendingLoading
} from 'src/app/state/exercise/exercise.selectors';
import { selectUser } from 'src/app/state/user/user.selector';

/**
 * Dashboard discovery widget: trending exercises.
 *
 * "Trending" is defined and ranked by the backend (GET /exercise/getTrending):
 * likes DESC with date DESC breaking ties — most-liked plus recently-added.
 *
 * The category pills re-dispatch `loadTrendingExercises` with a `categoryId`
 * rather than filtering a fixed list client-side, so each category gets its own
 * genuine top-N from the server instead of whatever survives filtering the
 * global top-N.
 */
@Component({
  selector: 'app-dashboard-trending-exercises',
  templateUrl: './dashboard-trending-exercises.component.html',
  styleUrls: ['./dashboard-trending-exercises.component.css']
})
export class DashboardTrendingExercisesComponent implements OnInit, OnDestroy {

  exercises: Exercises[] = [];
  categories: Categories[] = [];
  activeCategoryId: number | null = null;
  loading = false;

  user!: Users | null;

  private likedExerciseIds: number[] = [];
  /** exerciseIds flipped locally, pending backend reconciliation — fills the heart instantly. */
  private optimisticLikes = new Set<number>();

  private subs: Subscription[] = [];

  constructor(
    private store: Store,
    private router: Router,
    private dialog: MatDialog,
    private snackbar: SnackBarService
  ) { }

  ngOnInit(): void {
    this.store.dispatch(loadActiveCategories());
    this.store.dispatch(loadTrendingExercises({ categoryId: null }));
    this.store.dispatch(loadMyExerciseLikes());

    this.subs.push(
      this.store.select(selectUser).subscribe(user => this.user = user),

      this.store.select(selectActiveCategories).subscribe(list => this.categories = list ?? []),

      this.store.select(selectTrendingExercises).subscribe(list => this.exercises = list ?? []),

      this.store.select(selectTrendingCategoryId).subscribe(id => this.activeCategoryId = id),

      this.store.select(selectTrendingLoading).subscribe(loading => this.loading = loading),

      this.store.select(selectLikedExerciseIds).subscribe(ids => {
        this.likedExerciseIds = ids ?? [];
        // Fresh truth arrived from the backend — drop any optimistic overrides.
        this.optimisticLikes.clear();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ── Category toggle ─────────────────────────────────────────────────────────

  /** Re-requests the backend-ranked list scoped to `categoryId` (null = All). */
  selectCategory(categoryId: number | null): void {
    if (categoryId === this.activeCategoryId) { return; }
    this.store.dispatch(loadTrendingExercises({ categoryId }));
  }

  // ── Cards ───────────────────────────────────────────────────────────────────

  categoryNames(exercise: Exercises, limit = 2): string[] {
    return (exercise.categories ?? []).slice(0, limit).map(c => c.name);
  }

  extraCategoryCount(exercise: Exercises, limit = 2): number {
    return Math.max(0, (exercise.categories ?? []).length - limit);
  }

  /** Optimistic flip is +/-1 on top of the stored count, which may be null. */
  likeCount(exercise: Exercises): number {
    const stored = exercise.likes ?? 0;
    if (!this.optimisticLikes.has(exercise.id)) { return stored; }
    return Math.max(0, stored + (this.likedExerciseIds.includes(exercise.id) ? -1 : 1));
  }

  // ── Likes ───────────────────────────────────────────────────────────────────

  isLiked(exercise: Exercises): boolean {
    const cached = this.likedExerciseIds.includes(exercise.id);
    return this.optimisticLikes.has(exercise.id) ? !cached : cached;
  }

  likeExercise(exercise: Exercises): void {
    if (!this.user?.email) {
      this.promptLogin();
      return;
    }

    // Flip the heart instantly instead of waiting for the round-trip to land.
    if (this.optimisticLikes.has(exercise.id)) {
      this.optimisticLikes.delete(exercise.id);
    } else {
      this.optimisticLikes.add(exercise.id);
    }

    this.store.dispatch(likeExercise({ id: exercise.id }));

    this.snackbar.openSnackBar(
      this.isLiked(exercise) ? `You liked ${exercise.name}` : `Unliked ${exercise.name}`,
      ''
    );
  }

  private promptLogin(): void {
    const ref = this.dialog.open(PromptModalComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Login required',
        message: 'You need to be logged in to like an exercise. Log in to continue?',
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

  trackById(_: number, exercise: Exercises): number {
    return exercise.id;
  }
}
