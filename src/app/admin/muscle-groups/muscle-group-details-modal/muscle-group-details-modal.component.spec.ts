import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuscleGroupDetailsModalComponent } from './muscle-group-details-modal.component';

describe('MuscleGroupDetailsModalComponent', () => {
  let component: MuscleGroupDetailsModalComponent;
  let fixture: ComponentFixture<MuscleGroupDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MuscleGroupDetailsModalComponent]
    });
    fixture = TestBed.createComponent(MuscleGroupDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
