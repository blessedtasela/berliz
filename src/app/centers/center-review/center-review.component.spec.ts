import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterReviewComponent } from './center-review.component';

describe('CenterReviewComponent', () => {
  let component: CenterReviewComponent;
  let fixture: ComponentFixture<CenterReviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterReviewComponent]
    });
    fixture = TestBed.createComponent(CenterReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
