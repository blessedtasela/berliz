import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainersFeatureVideosComponent } from './trainers-feature-videos.component';

describe('TrainersFeatureVideosComponent', () => {
  let component: TrainersFeatureVideosComponent;
  let fixture: ComponentFixture<TrainersFeatureVideosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainersFeatureVideosComponent]
    });
    fixture = TestBed.createComponent(TrainersFeatureVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
