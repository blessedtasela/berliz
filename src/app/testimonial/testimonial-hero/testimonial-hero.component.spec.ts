import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { TestimonialHeroComponent } from './testimonial-hero.component';
import { TestimonialDialogService } from '../testimonial-dialog.service';

describe('TestimonialHeroComponent', () => {
  let component: TestimonialHeroComponent;
  let fixture: ComponentFixture<TestimonialHeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestimonialHeroComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: TestimonialDialogService, useValue: {} }
      ]
    });
    fixture = TestBed.createComponent(TestimonialHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
