import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

import { TestimonialListComponent } from './testimonial-list.component';
import { TestimonialDialogService } from '../testimonial-dialog.service';

describe('TestimonialListComponent', () => {
  let component: TestimonialListComponent;
  let fixture: ComponentFixture<TestimonialListComponent>;
  let testimonialDialog: jasmine.SpyObj<TestimonialDialogService>;
  let router: jasmine.SpyObj<Router>;
  let action: string | null;

  beforeEach(() => {
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    storeSpy.select.and.returnValue(of([]));
    testimonialDialog = jasmine.createSpyObj('TestimonialDialogService', ['openTestimonialForm']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    action = null;

    TestBed.configureTestingModule({
      declarations: [TestimonialListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: TestimonialDialogService, useValue: testimonialDialog },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { get queryParamMap() { return convertToParamMap(action ? { action } : {}); } } }
        },
      ]
    });
    fixture = TestBed.createComponent(TestimonialListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('reopens the form and strips the query param when returning from a login gate', () => {
    action = 'testimonial';
    fixture.detectChanges();

    expect(testimonialDialog.openTestimonialForm).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: {} }));
  });
});
