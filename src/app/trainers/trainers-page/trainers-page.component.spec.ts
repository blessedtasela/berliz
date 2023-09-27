import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainersPageComponent } from './trainers-page.component';

describe('TrainersPageComponent', () => {
  let component: TrainersPageComponent;
  let fixture: ComponentFixture<TrainersPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainersPageComponent]
    });
    fixture = TestBed.createComponent(TrainersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
