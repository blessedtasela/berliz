import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialsListComponent } from './testimonials-list.component';

describe('TestimonialsListComponent', () => {
  let component: TestimonialsListComponent;
  let fixture: ComponentFixture<TestimonialsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestimonialsListComponent]
    });
    fixture = TestBed.createComponent(TestimonialsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
