import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerIntroductionComponent } from './trainer-introduction.component';

describe('TrainerIntroductionComponent', () => {
  let component: TrainerIntroductionComponent;
  let fixture: ComponentFixture<TrainerIntroductionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerIntroductionComponent]
    });
    fixture = TestBed.createComponent(TrainerIntroductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
