import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { Categories } from 'src/app/models/categories.interface';
import { Centers } from 'src/app/models/centers.interface';
import { Exercises } from 'src/app/models/exercise.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';

import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

import { likeCategory, loadCategory, loadMyCategoryLikes } from 'src/app/state/category/category.actions';
import { selectLikedCategoryIds, selectSelectedCategory } from 'src/app/state/category/category.selectors';
import { loadActiveTrainers } from 'src/app/state/trainer/trainer.actions';
import { selectActiveTrainers } from 'src/app/state/trainer/trainer.selector';
import { loadActiveCenters } from 'src/app/state/center/center.actions';
import { selectActiveCenters } from 'src/app/state/center/center.selectors';
import { loadActiveExercises } from 'src/app/state/exercise/exercise.actions';
import { selectActiveExercises } from 'src/app/state/exercise/exercise.selectors';
import { selectUser } from 'src/app/state/user/user.selector';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.css']
})
export class CategoryDetailsComponent implements OnInit, OnDestroy {

  categoryId = 0;
  category: Categories | null = null;
  resolved = false;

  user: Users | null = null;

  /** Everything below is DERIVED client-side from the relations each entity carries. */
  trainers: Trainers[] = [];
  centers: Centers[] = [];
  exercises: Exercises[] = [];

  private allTrainers: Trainers[] = [];
  private allCenters: Centers[] = [];
  private allExercises: Exercises[] = [];

  private likedCategoryIds: number[] = [];
  /** categoryIds flipped locally, pending backend reconciliation — makes the heart fill instantly */
  private optimisticLikes = new Set<number>();

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private dialog: MatDialog,
    private snackbar: SnackBarService
  ) { }

  ngOnInit(): void {
    this.subs.push(
      this.route.paramMap.subscribe(params => {
        const id = Number(params.get('id'));
        this.categoryId = isNaN(id) ? 0 : id;
        this.resolved = false;

        if (this.categoryId > 0) {
          this.store.dispatch(loadCategory({ id: this.categoryId }));
        }
        this.applyFilters();
      })
    );

    this.store.dispatch(loadActiveTrainers());
    this.store.dispatch(loadActiveCenters());
    this.store.dispatch(loadActiveExercises());
    this.store.dispatch(loadMyCategoryLikes());

    this.subs.push(
      this.store.select(selectSelectedCategory).subscribe(category => {
        this.category = category ?? null;
        this.resolved = true;
      }),

      this.store.select(selectUser).subscribe(user => this.user = user),

      this.store.select(selectLikedCategoryIds).subscribe(ids => {
        this.likedCategoryIds = ids ?? [];
        // Fresh truth arrived from the backend — drop any optimistic overrides.
        this.optimisticLikes.clear();
      }),

      this.store.select(selectActiveTrainers).subscribe(list => {
        this.allTrainers = list ?? [];
        this.applyFilters();
      }),

      this.store.select(selectActiveCenters).subscribe(list => {
        this.allCenters = list ?? [];
        this.applyFilters();
      }),

      this.store.select(selectActiveExercises).subscribe(list => {
        this.allExercises = list ?? [];
        this.applyFilters();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ── Derived relations ───────────────────────────────────────────────────────

  private applyFilters(): void {
    const id = this.categoryId;

    this.trainers = this.allTrainers.filter(t => (t.categories ?? []).some(c => c.id === id));
    this.centers = this.allCenters.filter(c => (c.categoryIds ?? []).includes(id));
    this.exercises = this.allExercises.filter(e => (e.categories ?? []).some(c => c.id === id));
  }

  // ── Likes ───────────────────────────────────────────────────────────────────

  get isLiked(): boolean {
    const cached = this.likedCategoryIds.includes(this.categoryId);
    return this.optimisticLikes.has(this.categoryId) ? !cached : cached;
  }

  toggleLike(): void {
    if (!this.category) { return; }

    if (!this.user?.email) {
      this.promptLogin();
      return;
    }

    // Flip the heart instantly instead of waiting for the round-trip to land.
    if (this.optimisticLikes.has(this.categoryId)) {
      this.optimisticLikes.delete(this.categoryId);
    } else {
      this.optimisticLikes.add(this.categoryId);
    }

    this.store.dispatch(likeCategory({ id: this.categoryId }));

    this.snackbar.openSnackBar(
      this.isLiked ? `You liked ${this.category.name}` : `Unliked ${this.category.name}`,
      ''
    );
  }

  private promptLogin(): void {
    const ref = this.dialog.open(PromptModalComponent, {
      width: '400px',
      data: {
        confirmation: true,
        title: 'Login required',
        message: 'You need to be logged in to like a service. Log in to continue?',
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

  // ── Helpers ─────────────────────────────────────────────────────────────────

  backToServices(): void {
    this.router.navigate(['/services']);
  }

  formatUrl(name: string): string {
    return name?.replace(/ /g, '-') ?? '';
  }
}
