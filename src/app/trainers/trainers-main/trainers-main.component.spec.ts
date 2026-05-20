import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainersMainComponent } from './trainers-main.component';

describe('TrainersMainComponent', () => {
  let component: TrainersMainComponent;
  let fixture: ComponentFixture<TrainersMainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainersMainComponent]
    });
    fixture = TestBed.createComponent(TrainersMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
