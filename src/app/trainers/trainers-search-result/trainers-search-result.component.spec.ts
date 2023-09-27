import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainersSearchResultComponent } from './trainers-search-result.component';

describe('TrainersSearchResultComponent', () => {
  let component: TrainersSearchResultComponent;
  let fixture: ComponentFixture<TrainersSearchResultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainersSearchResultComponent]
    });
    fixture = TestBed.createComponent(TrainersSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
