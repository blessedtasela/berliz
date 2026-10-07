import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { Subject, of } from 'rxjs';

import { TestimonialListComponent } from './testimonial-list.component';
import { TestimonialDialogService } from '../testimonial-dialog.service';
import { loadActiveTestimonials, loadActiveTestimonialsFailure, loadActiveTestimonialsSuccess } from 'src/app/state/testimonial/testimonial.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';

describe('TestimonialListComponent', () => {
  let component: TestimonialListComponent;
  let fixture: ComponentFixture<TestimonialListComponent>;
  let testimonialDialog: jasmine.SpyObj<TestimonialDialogService>;
  let router: jasmine.SpyObj<Router>;
  let action: string | null;
  let actions$: Subject<any>;
  let storeSpy: jasmine.SpyObj<Store>;

  beforeEach(() => {
    actions$ = new Subject<any>();
    storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    storeSpy.select.and.returnValue(of([]));
    testimonialDialog = jasmine.createSpyObj('TestimonialDialogService', ['openTestimonialForm']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    action = null;

    TestBed.configureTestingModule({
      declarations: [TestimonialListComponent],
      imports: [LoadErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Actions, useValue: actions$ },
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

  describe('when the testimonials cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    beforeEach(() => fixture.detectChanges());

    it('shows a retryable error instead of "Stories coming soon"', () => {
      actions$.next(loadActiveTestimonialsFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load the testimonials");
      expect(el().textContent).toContain('Server exploded');
      expect(el().textContent).not.toContain('Stories coming soon');
    });

    it('retrying loads them again, and a success clears the error', () => {
      actions$.next(loadActiveTestimonialsFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(storeSpy.dispatch).toHaveBeenCalledWith(loadActiveTestimonials());

      actions$.next(loadActiveTestimonialsSuccess({ response: [] } as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(el().textContent).toContain('Stories coming soon');
    });

    it('shows the genuine "coming soon" state when nothing failed', () => {
      expect(el().textContent).toContain('Stories coming soon');
    });
  });
});
