import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrainerReviewComponent } from './my-trainer-review.component';

describe('MyTrainerReviewComponent', () => {
  let component: MyTrainerReviewComponent;
  let fixture: ComponentFixture<MyTrainerReviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerReviewComponent]
    });
    fixture = TestBed.createComponent(MyTrainerReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
