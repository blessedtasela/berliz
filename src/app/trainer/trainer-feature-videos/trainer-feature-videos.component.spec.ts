import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerFeatureVideosComponent } from './trainer-feature-videos.component';

describe('TrainerFeatureVideosComponent', () => {
  let component: TrainerFeatureVideosComponent;
  let fixture: ComponentFixture<TrainerFeatureVideosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerFeatureVideosComponent]
    });
    fixture = TestBed.createComponent(TrainerFeatureVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
