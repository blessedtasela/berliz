import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { AddTestimonialsModalComponent } from './add-testimonials-modal.component';
import { TestimonialService } from 'src/app/services/testimonial.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('AddTestimonialsModalComponent', () => {
  let component: AddTestimonialsModalComponent;
  let fixture: ComponentFixture<AddTestimonialsModalComponent>;

  beforeEach(() => {
    const testimonialServiceSpy = jasmine.createSpyObj('TestimonialService', ['addTestimonial']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [AddTestimonialsModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        ChangeDetectorRef,
        provideMockStore({ initialState: { users: [], centers: [] } }),
        { provide: TestimonialService, useValue: testimonialServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy }
      ]
    });
    fixture = TestBed.createComponent(AddTestimonialsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
