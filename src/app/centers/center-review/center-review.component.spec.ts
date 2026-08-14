import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CenterReviewComponent } from './center-review.component';

describe('CenterReviewComponent', () => {
  let component: CenterReviewComponent;
  let fixture: ComponentFixture<CenterReviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterReviewComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(CenterReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
