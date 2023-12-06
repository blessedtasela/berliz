import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { TestimonialsListComponent } from './testimonials-list/testimonials-list.component';
import { TestimonialsHeaderComponent } from './testimonials-header/testimonials-header.component';
import { TestimonialDetailsModalComponent } from './testimonial-details-modal/testimonial-details-modal.component';
import { AddTestimonialsModalComponent } from './add-testimonials-modal/add-testimonials-modal.component';
import { UpdateTestimonialsModalComponent } from './update-testimonials-modal/update-testimonials-modal.component';



@NgModule({
  declarations: [
    TestimonialsComponent,
    TestimonialsListComponent,
    TestimonialsHeaderComponent,
    TestimonialDetailsModalComponent,
    AddTestimonialsModalComponent,
    UpdateTestimonialsModalComponent
  ],
  imports: [
    CommonModule
  ]
})
export class TestimonialsModule { }
