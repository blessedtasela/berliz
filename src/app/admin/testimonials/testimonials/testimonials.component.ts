import { Actions } from '@ngrx/effects';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Testimonials } from 'src/app/models/testimonials.model';
import { loadTestimonials, loadTestimonialsFailure, loadTestimonialsSuccess } from 'src/app/state/testimonial/testimonial.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { selectTestimonials } from 'src/app/state/testimonial/testimonial.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
    selector: 'app-testimonials',
    templateUrl: './testimonials.component.html',
    styleUrls: ['./testimonials.component.css'],
    standalone: false
})
export class TestimonialsComponent {
  testimonialsData: Testimonials[] = [];
  totalTestimonials: number = 0;
  testimonialsLength: number = 0;
  searchComponent: string = 'testimonial'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];
  /** Why the list couldn't be loaded -- so a failed load never reads as an empty table. */
  loadError: string | null = null;

  readonly selectTestimonials = selectTestimonials;
  readonly testimonialSearchFields: AdminSearchField<Testimonials>[] = [
    { value: 'user', label: 'User email', accessor: t => t.userEmail },
    { value: 'center', label: 'Center', accessor: t => t.centerName },
    { value: 'trainer', label: 'Trainer', accessor: t => t.trainerName },
    { value: 'client', label: 'Client', accessor: t => t.clientName },
    { value: 'testimonial', label: 'Testimonial text', accessor: t => t.testimonial },
    { value: 'status', label: 'Status', accessor: t => t.status },
    { value: 'id', label: 'Testimonial id', accessor: t => t.id?.toString() },
  ];

  constructor(private store: Store, private actions$: Actions) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.subscriptions.push(watchLoadError(this.actions$, loadTestimonialsFailure, [loadTestimonials, loadTestimonialsSuccess], null, m => this.loadError = m));
    this.store.dispatch(loadTestimonials());
    this.subscriptions.push(
      this.store.select(selectTestimonials).subscribe((allTestimonials) => {
        this.testimonialsData = allTestimonials;
        this.totalTestimonials = allTestimonials.length
        this.testimonialsLength = allTestimonials.length
      })
    );
  }

  handleSearchResults(results: Testimonials[]): void {
    this.testimonialsData = results;
    this.totalTestimonials = results.length;
  }


  retryLoad(): void {
    this.store.dispatch(loadTestimonials());
  }
}
