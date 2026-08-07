import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Testimonials } from '../../models/testimonials.model';
import { loadActiveTestimonials } from 'src/app/state/testimonial/testimonial.actions';
import { selectActiveTestimonials } from 'src/app/state/testimonial/testimonial.selectors';
import { TestimonialDialogService } from '../testimonial-dialog.service';

@Component({
  selector: 'app-testimonial-list',
  templateUrl: './testimonial-list.component.html',
  styleUrls: ['./testimonial-list.component.css']
})
export class TestimonialListComponent implements OnInit, OnDestroy {
  testimonials: Testimonials[] = [];
  private subscription!: Subscription;

  constructor(
    private store: Store,
    private testimonialDialog: TestimonialDialogService
  ) { }

  ngOnInit() {
    this.store.dispatch(loadActiveTestimonials());
    this.subscription = this.store.select(selectActiveTestimonials).subscribe(testimonials => {
      this.testimonials = testimonials ?? [];
    });
  }

  ngOnDestroy() {
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
