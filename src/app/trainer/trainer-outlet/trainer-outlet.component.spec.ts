import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerOutletComponent } from './trainer-outlet.component';

describe('TrainerOutletComponent', () => {
  let component: TrainerOutletComponent;
  let fixture: ComponentFixture<TrainerOutletComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerOutletComponent]
    });
    fixture = TestBed.createComponent(TrainerOutletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
