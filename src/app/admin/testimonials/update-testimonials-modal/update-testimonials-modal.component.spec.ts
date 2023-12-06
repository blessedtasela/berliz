import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTestimonialsModalComponent } from './update-testimonials-modal.component';

describe('UpdateTestimonialsModalComponent', () => {
  let component: UpdateTestimonialsModalComponent;
  let fixture: ComponentFixture<UpdateTestimonialsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateTestimonialsModalComponent]
    });
    fixture = TestBed.createComponent(UpdateTestimonialsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
