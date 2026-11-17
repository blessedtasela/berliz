import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';
import { ListSkeletonComponent } from 'src/app/shared/list-skeleton/list-skeleton.component';
import { Categories } from 'src/app/models/categories.interface';
import { loadActiveCategories, loadActiveCategoriesSuccess, loadActiveCategoriesFailure } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { injectActionsOrNull, watchFirstLoad } from 'src/app/utils/first-load';
import { BERLIZ_SERVICES, BerlizService } from '../berliz-services';

/**
 * What Berliz offers: online, hybrid and in-person personal training, gyms and training centers, and the shop to
 * come — each linking to its own detail page. Below them, the Disciplines (Boxing, Yoga, Powerlifting…) people
 * can train in, each with a page of its own.
 */
@Component({
  selector: 'app-services-page',
  imports: [CommonModule, RouterModule, IconsModule, StrapiUrlPipe, ListSkeletonComponent],
  templateUrl: './services-page.component.html',
})
export class ServicesPageComponent implements OnInit, OnDestroy {
  readonly services: BerlizService[] = BERLIZ_SERVICES;
  disciplines$: Observable<Categories[]>;

  /**
   * GN-52: true once the first disciplines load has finished (never on the
   * server) -- same `watchFirstLoad` idiom `CategoriesComponent` (the
   * Disciplines page itself) already uses. `/services` is one of the
   * build-time-prerendered public routes; without this, its static
   * snapshot always caught `disciplines$` still empty (the initial store
   * value) and baked in "No disciplines yet." regardless of the real data,
   * while `/disciplines` showed all 15 because it already had this gate.
   */
  firstLoaded = false;
  private platformId = inject(PLATFORM_ID);
  private actionsOpt = injectActionsOrNull();
  private subscriptions: Subscription[] = [];

  constructor(private store: Store) {
    this.disciplines$ = this.store.select(selectActiveCategories);
  }

  ngOnInit(): void {
    this.store.dispatch(loadActiveCategories());
    if (this.actionsOpt) {
      this.subscriptions.push(watchFirstLoad(this.actionsOpt, this.platformId, [loadActiveCategoriesSuccess, loadActiveCategoriesFailure], () => this.firstLoaded = true));
    } else {
      this.firstLoaded = true;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  trackBySlug(_: number, s: BerlizService): string { return s.slug; }
  trackById(_: number, c: Categories): number { return c.id; }
}
