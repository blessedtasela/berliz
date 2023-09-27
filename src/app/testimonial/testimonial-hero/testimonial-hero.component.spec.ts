import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialHeroComponent } from './testimonial-hero.component';

describe('TestimonialHeroComponent', () => {
  let component: TestimonialHeroComponent;
  let fixture: ComponentFixture<TestimonialHeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestimonialHeroComponent]
    });
    fixture = TestBed.createComponent(TestimonialHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
