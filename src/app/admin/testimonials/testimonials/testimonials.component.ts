import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Testimonials } from 'src/app/models/testimonials.model';
import { loadTestimonials } from 'src/app/state/testimonial/testimonial.actions';
import { selectTestimonials } from 'src/app/state/testimonial/testimonial.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css']
})
export class TestimonialsComponent {
  testimonialsData: Testimonials[] = [];
  totalTestimonials: number = 0;
  testimonialsLength: number = 0;
  searchComponent: string = 'testimonial'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];

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

  constructor(private ngxService: NgxUiLoaderService,
    private store: Store) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadTestimonials());
    this.subscriptions.push(
      this.store.select(selectTestimonials).subscribe((allTestimonials) => {
        this.testimonialsData = allTestimonials;
        this.totalTestimonials = allTestimonials.length
        this.testimonialsLength = allTestimonials.length
        this.ngxService.stop()
      })
    );
  }

  handleSearchResults(results: Testimonials[]): void {
    this.testimonialsData = results;
    this.totalTestimonials = results.length;
  }

}
