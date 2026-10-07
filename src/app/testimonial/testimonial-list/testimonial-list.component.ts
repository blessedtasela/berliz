import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Testimonials } from '../../models/testimonials.model';
import { loadActiveTestimonials, loadActiveTestimonialsFailure, loadActiveTestimonialsSuccess } from 'src/app/state/testimonial/testimonial.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { selectActiveTestimonials } from 'src/app/state/testimonial/testimonial.selectors';
import { TestimonialDialogService } from '../testimonial-dialog.service';

@Component({
    selector: 'app-testimonial-list',
    templateUrl: './testimonial-list.component.html',
    styleUrls: ['./testimonial-list.component.css'],
    standalone: false
})
export class TestimonialListComponent implements OnInit, OnDestroy {
  testimonials: Testimonials[] = [];
  private subscription!: Subscription;

  /** Why the testimonials couldn't be loaded -- so a failed load never reads as "Stories coming soon". */
  loadError: string | null = null;
  private loadErrorSub?: Subscription;

  constructor(
    private store: Store,
    private actions$: Actions,
    private testimonialDialog: TestimonialDialogService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  retryLoad(): void {
    this.store.dispatch(loadActiveTestimonials());
  }

  ngOnInit() {
    this.loadErrorSub = watchLoadError(this.actions$, loadActiveTestimonialsFailure, [loadActiveTestimonials, loadActiveTestimonialsSuccess], null, m => this.loadError = m);
    this.store.dispatch(loadActiveTestimonials());
    this.subscription = this.store.select(selectActiveTestimonials).subscribe(testimonials => {
      this.testimonials = testimonials ?? [];
    });

    // A login gate (TestimonialDialogService) sent the user here with
    // ?action=testimonial after signing in -- reopen the form instead of
    // leaving them to find the button again. Strip the param so a manual
    // refresh doesn't reopen it.
    if (this.route.snapshot.queryParamMap.get('action') === 'testimonial') {
      this.openTestimonialForm();
      this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
    }
  }

  ngOnDestroy() {
    this.loadErrorSub?.unsubscribe();
    this.subscription?.unsubscribe();
  }

  /** Scrolls the strip roughly one card's width in either direction. */
  scrollStrip(container: HTMLElement, direction: 1 | -1): void {
    container.scrollBy({ left: direction * (container.clientWidth * 0.8), behavior: 'smooth' });
  }

  openTestimonialForm(): void {
    this.testimonialDialog.openTestimonialForm();
  }
}
