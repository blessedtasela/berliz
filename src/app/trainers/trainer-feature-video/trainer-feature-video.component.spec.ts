import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerFeatureVideoComponent } from './trainer-feature-video.component';

describe('TrainerFeatureVideoComponent', () => {
  let component: TrainerFeatureVideoComponent;
  let fixture: ComponentFixture<TrainerFeatureVideoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerFeatureVideoComponent]
    });
    fixture = TestBed.createComponent(TrainerFeatureVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
