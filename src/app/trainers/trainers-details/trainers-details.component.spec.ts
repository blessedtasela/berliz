import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { TrainersDetailsComponent } from './trainers-details.component';
import { TrainerService } from 'src/app/services/trainer.service';
import { TestimonialDialogService } from 'src/app/testimonial/testimonial-dialog.service';
import { BookingDialogService } from 'src/app/booking/booking-dialog.service';

describe('TrainersDetailsComponent', () => {
  let component: TrainersDetailsComponent;
  let fixture: ComponentFixture<TrainersDetailsComponent>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const trainerServiceSpy = jasmine.createSpyObj('TrainerService', ['getTrainer']);
    const testimonialDialogSpy = jasmine.createSpyObj('TestimonialDialogService', ['openTestimonialForm']);
    const bookingDialogSpy = jasmine.createSpyObj('BookingDialogService', ['openBookingForm']);

    TestBed.configureTestingModule({
      declarations: [TrainersDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => '1' }), snapshot: { paramMap: { get: () => '1' } } } },
        { provide: Router, useValue: routerSpy },
        { provide: TrainerService, useValue: trainerServiceSpy },
        { provide: TestimonialDialogService, useValue: testimonialDialogSpy },
        { provide: BookingDialogService, useValue: bookingDialogSpy }
      ]
    });
    fixture = TestBed.createComponent(TrainersDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
