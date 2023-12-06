import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialDetailsModalComponent } from './testimonial-details-modal.component';

describe('TestimonialDetailsModalComponent', () => {
  let component: TestimonialDetailsModalComponent;
  let fixture: ComponentFixture<TestimonialDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestimonialDetailsModalComponent]
    });
    fixture = TestBed.createComponent(TestimonialDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
