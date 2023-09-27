import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterReviewFormComponent } from './center-review-form.component';

describe('CenterReviewFormComponent', () => {
  let component: CenterReviewFormComponent;
  let fixture: ComponentFixture<CenterReviewFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterReviewFormComponent]
    });
    fixture = TestBed.createComponent(CenterReviewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
