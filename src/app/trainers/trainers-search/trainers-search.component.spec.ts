import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainersSearchComponent } from './trainers-search.component';

describe('TrainersSearchComponent', () => {
  let component: TrainersSearchComponent;
  let fixture: ComponentFixture<TrainersSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainersSearchComponent]
    });
    fixture = TestBed.createComponent(TrainersSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
