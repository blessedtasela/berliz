import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerClientReviewComponent } from './trainer-client-review.component';

describe('TrainerClientReviewComponent', () => {
  let component: TrainerClientReviewComponent;
  let fixture: ComponentFixture<TrainerClientReviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerClientReviewComponent]
    });
    fixture = TestBed.createComponent(TrainerClientReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
