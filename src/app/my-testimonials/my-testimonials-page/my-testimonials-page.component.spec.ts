import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { MyTestimonialsPageComponent } from './my-testimonials-page.component';
import { TestimonialService } from 'src/app/services/testimonial.service';
import { TestimonialDialogService } from 'src/app/testimonial/testimonial-dialog.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('MyTestimonialsPageComponent', () => {
  let component: MyTestimonialsPageComponent;
  let fixture: ComponentFixture<MyTestimonialsPageComponent>;

  beforeEach(() => {
    const testimonialServiceSpy = jasmine.createSpyObj('TestimonialService', ['getMyTestimonials', 'updateTestimonial']);
    testimonialServiceSpy.getMyTestimonials.and.returnValue(of({ data: [] }));
    const testimonialDialogServiceSpy = jasmine.createSpyObj('TestimonialDialogService', ['openTestimonialForm']);
    const snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, MyTestimonialsPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: TestimonialService, useValue: testimonialServiceSpy },
        { provide: TestimonialDialogService, useValue: testimonialDialogServiceSpy },
        { provide: SnackBarService, useValue: snackBarSpy }
      ]
    });
    fixture = TestBed.createComponent(MyTestimonialsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
