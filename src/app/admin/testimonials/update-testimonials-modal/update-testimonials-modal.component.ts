import { Component, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-update-testimonials-modal',
  templateUrl: './update-testimonials-modal.component.html',
  styleUrls: ['./update-testimonials-modal.component.css']
})
export class UpdateTestimonialsModalComponent {
  onUpdateTestimonialEmit = new EventEmitter()
}
