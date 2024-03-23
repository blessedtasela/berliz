import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainersIntroductionComponent } from './trainers-introduction.component';

describe('TrainersIntroductionComponent', () => {
  let component: TrainersIntroductionComponent;
  let fixture: ComponentFixture<TrainersIntroductionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainersIntroductionComponent]
    });
    fixture = TestBed.createComponent(TrainersIntroductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
