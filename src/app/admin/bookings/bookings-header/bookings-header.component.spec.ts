import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { BookingsHeaderComponent } from './bookings-header.component';

describe('BookingsHeaderComponent', () => {
  let component: BookingsHeaderComponent;
  let fixture: ComponentFixture<BookingsHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BookingsHeaderComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(BookingsHeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
