import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTestimonialsModalComponent } from './add-testimonials-modal.component';

describe('AddTestimonialsModalComponent', () => {
  let component: AddTestimonialsModalComponent;
  let fixture: ComponentFixture<AddTestimonialsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddTestimonialsModalComponent]
    });
    fixture = TestBed.createComponent(AddTestimonialsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
