import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { BookingsEmptyComponent } from './bookings-empty.component';

describe('BookingsEmptyComponent', () => {
  let component: BookingsEmptyComponent;
  let fixture: ComponentFixture<BookingsEmptyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BookingsEmptyComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(BookingsEmptyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
