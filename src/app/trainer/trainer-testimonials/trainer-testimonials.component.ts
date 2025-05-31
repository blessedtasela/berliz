import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TrainerTestimonials } from 'src/app/models/trainers.interface';
import { NewsletterStateService } from 'src/app/services/newsletter-state.service';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-trainer-testimonials',
  templateUrl: './trainer-testimonials.component.html',
  styleUrls: ['./trainer-testimonials.component.css']
})
export class TrainerTestimonialsComponent {
  trainerTestimonials: TrainerTestimonials[] = [];
  showAllTestimonials: boolean = false;

  constructor(private stateService: StateService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private newsletterStateService: NewsletterStateService,) {
    this.trainerTestimonials = [{
      id: 1,
      // trainer: ,
      // client: ,
      testimonial: "My testinomy 1",
      date: new Date(),
      lastUpdate: new Date(),
    },
    {
      id: 1,
      // trainer: ,
      // client: ,
      testimonial: "My testinomy 2",
      date: new Date(),
      lastUpdate: new Date(),
    },
    ];
  }

  ngOnInit(): void {
    this.handleEmitEvent()
  }

  handleEmitEvent() {
    this.newsletterStateService.getAllNewsletters().subscribe((newsletter) => {
      this.ngxService.start()
      this.newsletterStateService.setAllNewsletterSubject(newsletter);
      this.ngxService.stop()
    });
  }

  allReviews() {
    this.showAllTestimonials = !this.showAllTestimonials;
  }
}


