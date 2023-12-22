import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchTestimonialComponent } from './search-testimonial.component';

describe('SearchTestimonialComponent', () => {
  let component: SearchTestimonialComponent;
  let fixture: ComponentFixture<SearchTestimonialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchTestimonialComponent]
    });
    fixture = TestBed.createComponent(SearchTestimonialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
