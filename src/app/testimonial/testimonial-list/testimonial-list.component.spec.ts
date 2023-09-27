import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialListComponent } from './testimonial-list.component';

describe('TestimonialListComponent', () => {
  let component: TestimonialListComponent;
  let fixture: ComponentFixture<TestimonialListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestimonialListComponent]
    });
    fixture = TestBed.createComponent(TestimonialListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
