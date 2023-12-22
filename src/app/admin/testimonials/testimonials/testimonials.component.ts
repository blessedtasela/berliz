import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Testimonials } from 'src/app/models/testimonials.model';
import { TestimonialStateService } from 'src/app/services/testimonial-state.service';

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

  constructor(private ngxService: NgxUiLoaderService,
    public testimonialStateService: TestimonialStateService) {
  }

  ngOnInit(): void {
    this.testimonialStateService.allTestimonialsData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.testimonialsData = cachedData;
        this.totalTestimonials = cachedData.length
        this.testimonialsLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.testimonialStateService.getAllTestimonials().subscribe((allTestimonials) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.testimonialsData = allTestimonials;
      this.totalTestimonials = allTestimonials.length
      this.testimonialsLength = allTestimonials.length
      this.testimonialStateService.setAllTestimonialsSubject(this.testimonialsData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: Testimonials[]): void {
    this.testimonialsData = results;
    this.totalTestimonials = results.length;
  }

}

