import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Testimonials } from 'src/app/models/testimonials.model';
import { loadTestimonials } from 'src/app/state/testimonial/testimonial.actions';
import { selectTestimonials } from 'src/app/state/testimonial/testimonial.selectors';

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
