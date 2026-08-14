import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { TestimonialDetailPageComponent } from './testimonial-detail-page.component';
import { selectTestimonials } from 'src/app/state/testimonial/testimonial.selectors';

describe('TestimonialDetailPageComponent', () => {
  let component: TestimonialDetailPageComponent;
  let fixture: ComponentFixture<TestimonialDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestimonialDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectTestimonials, value: [] }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } }
      ]
    });

    fixture = TestBed.createComponent(TestimonialDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
