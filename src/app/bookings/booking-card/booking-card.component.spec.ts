import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { BookingCardComponent } from './booking-card.component';
import { Booking } from 'src/app/models/booking.model';

describe('BookingCardComponent', () => {
  let component: BookingCardComponent;
  let fixture: ComponentFixture<BookingCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BookingCardComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(BookingCardComponent);
    component = fixture.componentInstance;
    component.booking = {
      id: 1,
      clientId: 1,
      clientFirstname: 'Jane',
      clientLastname: 'Doe',
      clientEmail: 'jane@example.com',
      trainerId: 2,
      trainerName: 'Trainer Name',
      centerId: null,
      centerName: null,
      scheduledAt: new Date(),
      durationMinutes: 60,
      status: 'pending',
      notes: ''
    } as Booking;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
