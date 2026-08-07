import { Component } from '@angular/core';
import { TestimonialDialogService } from '../testimonial-dialog.service';

@Component({
  selector: 'app-testimonial-hero',
  templateUrl: './testimonial-hero.component.html',
  styleUrls: ['./testimonial-hero.component.css']
})
export class TestimonialHeroComponent {

  constructor(private testimonialDialog: TestimonialDialogService) { }

  openTestimonialForm(): void {
    this.testimonialDialog.openTestimonialForm();
  }
}
