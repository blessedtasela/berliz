import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';

import { TrainersDetailsComponent } from './trainers-details.component';
import { TrainerService } from 'src/app/services/trainer.service';
import { TestimonialDialogService } from 'src/app/testimonial/testimonial-dialog.service';
import { BookingLauncherService } from 'src/app/booking/booking-launcher.service';

describe('TrainersDetailsComponent', () => {
  let component: TrainersDetailsComponent;
  let fixture: ComponentFixture<TrainersDetailsComponent>;
  let router: jasmine.SpyObj<Router>;

  function setup(slug: string, activeTrainers: Observable<any> = of({ data: [] })) {
    router = jasmine.createSpyObj('Router', ['navigate']);
    const trainerServiceSpy = jasmine.createSpyObj('TrainerService', ['getActiveTrainers']);
    trainerServiceSpy.getActiveTrainers.and.returnValue(activeTrainers);
    const testimonialDialogSpy = jasmine.createSpyObj('TestimonialDialogService', ['openTestimonialForm']);
    const bookingLauncherSpy = jasmine.createSpyObj('BookingLauncherService', ['startBooking', 'startLevelUp']);
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [TrainersDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ name: slug })),
            snapshot: { paramMap: convertToParamMap({ name: slug }), queryParamMap: convertToParamMap({}) }
          }
        },
        { provide: Router, useValue: router },
        { provide: TrainerService, useValue: trainerServiceSpy },
        { provide: TestimonialDialogService, useValue: testimonialDialogSpy },
        { provide: BookingLauncherService, useValue: bookingLauncherSpy },
        { provide: MatDialog, useValue: matDialogSpy }
      ]
    });
    fixture = TestBed.createComponent(TrainersDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  const blessedFit = { id: 1, name: 'Blessed Fit' };

  it('should create', () => {
    setup('anyone');
    expect(component).toBeTruthy();
  });

  describe('when the trainer link matches nobody', () => {
    it('suggests the trainer a near-miss slug was meant for, instead of redirecting', () => {
      const el = setup('blesed-fit', of({ data: [blessedFit] }));

      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.notFound).toBeTrue();
      expect(el.textContent).toContain('Did you mean');
      expect(el.textContent).toContain('Blessed Fit');
      expect(component.suggestionLink()).toEqual(['/trainers', 'blessed-fit']);
    });

    it('sends the visitor to the trainers directory when nothing is close', () => {
      setup('blessed-tasela', of({ data: [blessedFit] }));

      expect(router.navigate).toHaveBeenCalledOnceWith(['/trainers'], { replaceUrl: true });
    });

    it('sends the visitor to the directory when there are no trainers at all', () => {
      setup('blessed-fit', of({ data: [] }));

      expect(router.navigate).toHaveBeenCalledOnceWith(['/trainers'], { replaceUrl: true });
    });

    it('keeps the plain not-found card when the trainers could not be loaded, rather than bouncing away', () => {
      const el = setup('blessed-fit', throwError(() => new Error('boom')));

      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.notFound).toBeTrue();
      expect(el.textContent).toContain('Trainer not found');
      expect(el.textContent).not.toContain('Did you mean');
    });
  });
});
