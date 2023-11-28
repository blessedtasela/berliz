import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMuscleGroupModalComponent } from './update-muscle-group-modal.component';

describe('UpdateMuscleGroupModalComponent', () => {
  let component: UpdateMuscleGroupModalComponent;
  let fixture: ComponentFixture<UpdateMuscleGroupModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateMuscleGroupModalComponent]
    });
    fixture = TestBed.createComponent(UpdateMuscleGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
