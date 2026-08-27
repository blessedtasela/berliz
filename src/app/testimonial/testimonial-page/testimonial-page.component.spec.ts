import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { TestimonialPageComponent } from './testimonial-page.component';

describe('TestimonialPageComponent', () => {
  let component: TestimonialPageComponent;
  let fixture: ComponentFixture<TestimonialPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestimonialPageComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(TestimonialPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
