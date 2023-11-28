import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerDetailsModalComponent } from './trainer-details-modal.component';

describe('TrainerDetailsModalComponent', () => {
  let component: TrainerDetailsModalComponent;
  let fixture: ComponentFixture<TrainerDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerDetailsModalComponent]
    });
    fixture = TestBed.createComponent(TrainerDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
