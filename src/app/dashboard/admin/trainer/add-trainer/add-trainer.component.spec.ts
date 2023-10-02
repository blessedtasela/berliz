import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTrainerComponent } from './add-trainer.component';

describe('AddTrainerComponent', () => {
  let component: AddTrainerComponent;
  let fixture: ComponentFixture<AddTrainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddTrainerComponent]
    });
    fixture = TestBed.createComponent(AddTrainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
