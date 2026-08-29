import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';

import { TestimonialHeroComponent } from './testimonial-hero.component';
import { TestimonialDialogService } from '../testimonial-dialog.service';

describe('TestimonialHeroComponent', () => {
  let component: TestimonialHeroComponent;
  let fixture: ComponentFixture<TestimonialHeroComponent>;
  let testimonialDialog: jasmine.SpyObj<TestimonialDialogService>;
  let router: jasmine.SpyObj<Router>;
  let action: string | null;

  beforeEach(() => {
    testimonialDialog = jasmine.createSpyObj('TestimonialDialogService', ['openTestimonialForm']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    action = null;

    TestBed.configureTestingModule({
      declarations: [TestimonialHeroComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: TestimonialDialogService, useValue: testimonialDialog },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { get queryParamMap() { return convertToParamMap(action ? { action } : {}); } } }
        },
      ]
    });
    fixture = TestBed.createComponent(TestimonialHeroComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('does not reopen the form when there is no pending action', () => {
    fixture.detectChanges();
    expect(testimonialDialog.openTestimonialForm).not.toHaveBeenCalled();
  });

  it('reopens the form and strips the query param when returning from a login gate', () => {
    action = 'testimonial';
    fixture.detectChanges();

    expect(testimonialDialog.openTestimonialForm).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: {} }));
  });
});
