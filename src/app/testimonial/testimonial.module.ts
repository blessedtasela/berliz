import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialPageComponent } from './testimonial-page/testimonial-page.component';
import { TestimonialHeroComponent } from './testimonial-hero/testimonial-hero.component';
import { TestimonialFormComponent } from './testimonial-form/testimonial-form.component';
import { TestimonialListComponent } from './testimonial-list/testimonial-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarModule } from '../navbar/navbar.module';
import { FooterModule } from '../footer/footer.module';



@NgModule({
  declarations: [
    TestimonialPageComponent,
    TestimonialHeroComponent,
    TestimonialFormComponent,
    TestimonialListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarModule,
    FooterModule
  ]
})
export class TestimonialModule { }
