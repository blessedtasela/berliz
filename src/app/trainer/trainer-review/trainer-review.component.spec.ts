import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerReviewComponent } from './trainer-review.component';

describe('TrainerReviewComponent', () => {
  let component: TrainerReviewComponent;
  let fixture: ComponentFixture<TrainerReviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerReviewComponent]
    });
    fixture = TestBed.createComponent(TrainerReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
