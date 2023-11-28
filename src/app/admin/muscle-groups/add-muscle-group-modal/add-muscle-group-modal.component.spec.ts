import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMuscleGroupModalComponent } from './add-muscle-group-modal.component';

describe('AddMuscleGroupModalComponent', () => {
  let component: AddMuscleGroupModalComponent;
  let fixture: ComponentFixture<AddMuscleGroupModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddMuscleGroupModalComponent]
    });
    fixture = TestBed.createComponent(AddMuscleGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
