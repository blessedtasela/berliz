import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerTestimonialsComponent } from './trainer-testimonials.component';

describe('TrainerTestimonialsComponent', () => {
  let component: TrainerTestimonialsComponent;
  let fixture: ComponentFixture<TrainerTestimonialsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerTestimonialsComponent]
    });
    fixture = TestBed.createComponent(TrainerTestimonialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
