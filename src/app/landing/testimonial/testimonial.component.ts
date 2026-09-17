import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Testimonials } from 'src/app/models/testimonials.model';
import { loadActiveTestimonials } from 'src/app/state/testimonial/testimonial.actions';
import { selectActiveTestimonials } from 'src/app/state/testimonial/testimonial.selectors';

@Component({
  selector: 'app-testimonial',
  templateUrl: './testimonial.component.html',
  styleUrls: ['./testimonial.component.css']
})
export class TestimonialComponent implements OnInit, OnDestroy {
  testimonials: Testimonials[] = [];
  testimonialIndex: number = 0;
  private intervalId: any;
  private subscription!: Subscription;

  constructor(
    private store: Store,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  ngOnInit() {
    this.store.dispatch(loadActiveTestimonials());
    this.subscription = this.store.select(selectActiveTestimonials).subscribe(testimonials => {
      this.testimonials = testimonials ?? [];
      this.testimonialIndex = 0;
    });
    // A recurring timer never clears during a one-shot build-time prerender
    // (ngOnDestroy never fires), which keeps Angular's zone permanently
    // "unstable" and hangs the render forever -- and auto-advancing a
    // carousel makes no sense in a static snapshot anyway.
    if (isPlatformBrowser(this.platformId)) {
      this.testimonialCounter();
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    clearInterval(this.intervalId);
  }

  testimonialCounter() {
    this.intervalId = setInterval(() => {
      this.toggleTestimonial(1);
    }, 8000);
  }

  toggleTestimonial(n: number): void {
    if (!this.testimonials.length) return;
    this.testimonialIndex = (this.testimonialIndex + n + this.testimonials.length) % this.testimonials.length;
  }

}
