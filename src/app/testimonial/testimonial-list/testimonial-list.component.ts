import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Testimonials } from '../../models/testimonials.model';
import { loadActiveTestimonials } from 'src/app/state/testimonial/testimonial.actions';
import { selectActiveTestimonials } from 'src/app/state/testimonial/testimonial.selectors';

@Component({
  selector: 'app-testimonial-list',
  templateUrl: './testimonial-list.component.html',
  styleUrls: ['./testimonial-list.component.css']
})
export class TestimonialListComponent implements OnInit, OnDestroy {
  testimonials: Testimonials[] = [];
  testimonialIndex: number = 0;
  private intervalId: any;
  private subscription!: Subscription;

  constructor(private store: Store) { }

  ngOnInit() {
    this.store.dispatch(loadActiveTestimonials());
    this.subscription = this.store.select(selectActiveTestimonials).subscribe(testimonials => {
      this.testimonials = testimonials ?? [];
      this.testimonialIndex = 0;
    });
    this.testimonialCounter();
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
