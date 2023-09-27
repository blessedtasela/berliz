import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerLocationsComponent } from './trainer-locations.component';

describe('TrainerLocationsComponent', () => {
  let component: TrainerLocationsComponent;
  let fixture: ComponentFixture<TrainerLocationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerLocationsComponent]
    });
    fixture = TestBed.createComponent(TrainerLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
