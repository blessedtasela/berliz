import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Testimonials } from 'src/app/models/testimonials.model';
import { loadTestimonials } from 'src/app/state/testimonial/testimonial.actions';
import { selectTestimonials } from 'src/app/state/testimonial/testimonial.selectors';

/**
 * Routed detail page for a single testimonial —
 * `/dashboard/testimonials/:id` (also reachable via
 * `/dashboard/hub/testimonials/:id`, same lazy module).
 *
 * Replaces the old TestimonialDetailsModalComponent dialog. Looks the
 * testimonial up in the already-loaded `testimonials` slice and dispatches
 * `loadTestimonials()` if empty (direct link / refresh).
 */
@Component({
  selector: 'app-testimonial-detail-page',
  templateUrl: './testimonial-detail-page.component.html',
  styleUrls: ['./testimonial-detail-page.component.css']
})
export class TestimonialDetailPageComponent implements OnInit, OnDestroy {
  testimonialData: Testimonials | null = null;
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
          this.testimonialData = null;
          return;
        }
        this.loadTestimonial(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTestimonial(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectTestimonials)
      .pipe(takeUntil(this.destroy$))
      .subscribe(testimonials => {
        const found = (testimonials || []).find(testimonial => testimonial.id === id);
        if (found) {
          this.testimonialData = found;
          this.loading = false;
        } else if (!testimonials || testimonials.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadTestimonials());
          }
        } else {
          this.testimonialData = null;
          this.loading = false;
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
