import { Component, Input, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { Categories } from 'src/app/models/categories.interface';
import { PublicExercise } from 'src/app/models/exercise.interface';
import { Users } from 'src/app/models/users.interface';

import { loadPublicExercises, loadPublicExercisesFailure, loadPublicExercisesSuccess } from 'src/app/state/exercise/exercise.actions';
import { selectPublicExercises } from 'src/app/state/exercise/exercise.selectors';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { selectUser } from 'src/app/state/user/user.selector';
import { exerciseDemoUrl } from 'src/app/utils/exercise-demo';
import { Actions } from '@ngrx/effects';
import { injectActionsOrNull, watchFirstLoad } from 'src/app/utils/first-load';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';

/**
 * PUBLIC exercise browsing. Rendered as its own full page at
 * `/disciplines/exercises`, with a cinematic hero banner (see
 * exercises-section.component.html). There was no working public exercises
 * page to reuse: the old `/exercises` route pointed at a "Coming Soon" stub,
 * so this is built fresh on the slim `loadPublicExercises()` /
 * `selectPublicExercises` slice that `CategoryDetailsComponent` also
 * derives its exercise list from (text and tags only; each demo image is its own cacheable URL).
 *
 * Also reused with `[embedded]="true"` on the Programs page (`/services`),
 * the same way `EquipmentPageComponent` is — that drops the standalone hero
 * in favor of a compact section heading, since the page already has its own
 * hero.
 *
 * Anonymous visitors see at most `previewLimit` movements; the rest sits behind
 * a login call-to-action instead of the show-more toggle.
 */
@Component({
    selector: 'app-exercises-section',
    templateUrl: './exercises-section.component.html',
    standalone: false
})
export class ExercisesSectionComponent implements OnInit, OnDestroy {
  /** True once the first load has finished (never on the server): a skeleton shows until then instead of "coming soon". */
  firstLoaded = false;
  private platformId = inject(PLATFORM_ID);
  private actionsOpt = injectActionsOrNull();

  get actionsAvailable(): boolean {
    return !!this.actionsOpt;
  }


  /** Hides the standalone hero when this sits inside another page. */
  @Input() embedded = false;

  exercises: PublicExercise[] = [];
  categories: Categories[] = [];
  user: Users | null = null;

  searchTerm = '';
  selectedCategoryId: number | null = null;

  /** How many cards a single "page" of the grid shows. */
  readonly pageSize = 12;
  /** Hard ceiling for visitors who are not logged in. */
  readonly previewLimit = 20;

  showFullData = false;
  visibleItems = this.pageSize;

  demoUrl = exerciseDemoUrl;

  private subscriptions: Subscription[] = [];

  /** Why the exercises couldn't be loaded -- so a failed load never reads as "coming soon". */
  loadError: string | null = null;

  constructor(private store: Store) { }

  retryLoad(): void {
    this.store.dispatch(loadPublicExercises());
  }

  ngOnInit(): void {
    this.store.dispatch(loadPublicExercises());
    this.store.dispatch(loadActiveCategories());

    this.subscriptions.push(
      this.actionsOpt
        ? watchFirstLoad(this.actionsOpt, this.platformId, [loadPublicExercisesSuccess, loadPublicExercisesFailure], () => this.firstLoaded = true)
        : new Subscription(),
      this.actionsOpt
        ? watchLoadError(this.actionsOpt, loadPublicExercisesFailure, [loadPublicExercises, loadPublicExercisesSuccess], null, m => this.loadError = m)
        : new Subscription(),
      this.store.select(selectPublicExercises).subscribe(list => this.exercises = list ?? []),
      this.store.select(selectActiveCategories).subscribe(list => this.categories = list ?? []),
      this.store.select(selectUser).subscribe(user => this.user = user ?? null)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ── Filtering ───────────────────────────────────────────────────────────────

  get filteredExercises(): PublicExercise[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.exercises.filter(exercise => {
      const matchesTerm = !term
        || (exercise.name ?? '').toLowerCase().includes(term)
        || (exercise.description ?? '').toLowerCase().includes(term)
        || (exercise.muscleGroups ?? []).some(mg => (mg.name ?? '').toLowerCase().includes(term));

      const matchesCategory = this.selectedCategoryId === null
        || (exercise.categories ?? []).some(c => c.id === this.selectedCategoryId);

      return matchesTerm && matchesCategory;
    });
  }

  get hasActiveFilters(): boolean {
    return !!this.searchTerm.trim() || this.selectedCategoryId !== null;
  }

  selectCategory(id: number | null): void {
    this.selectedCategoryId = this.selectedCategoryId === id ? null : id;
    // A narrower result set should start collapsed again.
    this.collapse();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = null;
    this.collapse();
  }

  toggleData(): void {
    this.showFullData = !this.showFullData;
    this.visibleItems = this.showFullData ? this.browsableExercises.length : this.pageSize;
  }

  private collapse(): void {
    this.showFullData = false;
    this.visibleItems = this.pageSize;
  }

  // ── Login gate ──────────────────────────────────────────────────────────────

  get isLoggedIn(): boolean {
    return !!this.user?.email;
  }

  /**
   * The matches a visitor is allowed to reach at all: everything when signed
   * in, only the first `previewLimit` otherwise.
   */
  get browsableExercises(): PublicExercise[] {
    const matches = this.filteredExercises;
    return this.isLoggedIn ? matches : matches.slice(0, this.previewLimit);
  }

  /** The slice actually rendered right now (show-more expands within the cap). */
  get visibleExercises(): PublicExercise[] {
    return this.browsableExercises.slice(0, this.visibleItems);
  }

  get canShowMore(): boolean {
    return this.browsableExercises.length > this.pageSize;
  }

  /** Anonymous visitor with matches sitting behind the login wall. */
  get isLoginGated(): boolean {
    return !this.isLoggedIn && this.filteredExercises.length > this.previewLimit;
  }

  get totalMatches(): number {
    return this.filteredExercises.length;
  }

  trackByExerciseId(_index: number, exercise: PublicExercise): number {
    return exercise.id;
  }
}
