import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainersClientReviewsComponent } from './trainers-client-reviews.component';

describe('TrainersClientReviewsComponent', () => {
  let component: TrainersClientReviewsComponent;
  let fixture: ComponentFixture<TrainersClientReviewsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainersClientReviewsComponent]
    });
    fixture = TestBed.createComponent(TrainersClientReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
