import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerFormModalComponent } from './trainer-form-modal.component';

describe('TrainerFormModalComponent', () => {
  let component: TrainerFormModalComponent;
  let fixture: ComponentFixture<TrainerFormModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerFormModalComponent]
    });
    fixture = TestBed.createComponent(TrainerFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
