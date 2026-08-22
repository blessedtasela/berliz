import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { provideMockStore } from '@ngrx/store/testing';

import { MyTrainerTestimonialsComponent } from './my-trainer-testimonials.component';

describe('MyTrainerTestimonialsComponent', () => {
  let component: MyTrainerTestimonialsComponent;
  let fixture: ComponentFixture<MyTrainerTestimonialsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerTestimonialsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore()
      ]
    });
    fixture = TestBed.createComponent(MyTrainerTestimonialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
