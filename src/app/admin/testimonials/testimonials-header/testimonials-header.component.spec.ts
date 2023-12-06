import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialsHeaderComponent } from './testimonials-header.component';

describe('TestimonialsHeaderComponent', () => {
  let component: TestimonialsHeaderComponent;
  let fixture: ComponentFixture<TestimonialsHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestimonialsHeaderComponent]
    });
    fixture = TestBed.createComponent(TestimonialsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
