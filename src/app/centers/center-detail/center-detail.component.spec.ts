import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';

import { CenterDetailComponent } from './center-detail.component';
import { CenterService } from 'src/app/services/center.service';
import { AvailabilityService } from 'src/app/services/availability.service';
import { ProviderAnalyticsService } from 'src/app/services/provider-analytics.service';
import { SeoService } from 'src/app/services/seo.service';
import { TestimonialDialogService } from 'src/app/testimonial/testimonial-dialog.service';
import { BookingLauncherService } from 'src/app/booking/booking-launcher.service';
import { selectActiveCenters } from 'src/app/state/center/center.selectors';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';

describe('CenterDetailComponent', () => {
  let component: CenterDetailComponent;
  let fixture: ComponentFixture<CenterDetailComponent>;
  let store: MockStore;

  const ironWorks = { id: 9, name: 'Iron Works', motto: 'Lift', address: '1 Main St', categoryIds: [] };

  function setup(opts: { slug?: string; centers?: any[]; availability?: Observable<any> } = {}) {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const centerServiceSpy = jasmine.createSpyObj('CenterService', [
      'getIntroductionsByCenterId', 'getLocationsByCenterId', 'getEquipmentByCenterId',
      'getPricingByCenterId', 'getPhotoAlbumsByCenterId', 'getVideoAlbumsByCenterId',
      'getCenterTrainersByCenterId'
    ]);
    centerServiceSpy.getIntroductionsByCenterId.and.returnValue(of(null));
    centerServiceSpy.getLocationsByCenterId.and.returnValue(of(null));
    centerServiceSpy.getEquipmentByCenterId.and.returnValue(of(null));
    centerServiceSpy.getPricingByCenterId.and.returnValue(of(null));
    centerServiceSpy.getPhotoAlbumsByCenterId.and.returnValue(of(null));
    centerServiceSpy.getVideoAlbumsByCenterId.and.returnValue(of(null));
    centerServiceSpy.getCenterTrainersByCenterId.and.returnValue(of(null));
    const availabilitySpy = jasmine.createSpyObj('AvailabilityService', ['getProviderAvailability']);
    availabilitySpy.getProviderAvailability.and.returnValue(opts.availability ?? of({ data: [] }));
    const testimonialDialogSpy = jasmine.createSpyObj('TestimonialDialogService', ['openTestimonialForm']);
    const bookingLauncherSpy = jasmine.createSpyObj('BookingLauncherService', ['startBooking', 'startLevelUp']);
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const analyticsSpy = jasmine.createSpyObj('ProviderAnalyticsService', ['recordProfileView']);
    const seoSpy = jasmine.createSpyObj('SeoService', ['updatePageData']);

    TestBed.configureTestingModule({
      declarations: [CenterDetailComponent],
      imports: [StrapiUrlPipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({ selectors: [{ selector: selectActiveCenters, value: opts.centers ?? [] }] }),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap(opts.slug ? { name: opts.slug } : {})),
            snapshot: { queryParamMap: convertToParamMap({}) }
          }
        },
        { provide: Router, useValue: routerSpy },
        { provide: CenterService, useValue: centerServiceSpy },
        { provide: AvailabilityService, useValue: availabilitySpy },
        { provide: ProviderAnalyticsService, useValue: analyticsSpy },
        { provide: SeoService, useValue: seoSpy },
        { provide: TestimonialDialogService, useValue: testimonialDialogSpy },
        { provide: BookingLauncherService, useValue: bookingLauncherSpy },
        { provide: MatDialog, useValue: matDialogSpy }
      ]
    });
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(CenterDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  // provideMockStore({ selectors }) patches the shared selector instance; reset it so it can't leak into later specs.
  afterEach(() => store?.resetSelectors());

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  describe('online booking', () => {
    const bookButtons = (el: HTMLElement) =>
      Array.from(el.querySelectorAll('button')).filter(b => b.textContent?.includes('Book a session'));

    it('is offered when the center has weekly hours', () => {
      const el = setup({
        slug: 'iron-works', centers: [ironWorks],
        availability: of({ data: [{ dayOfWeek: 1, isActive: true }, { dayOfWeek: 2, isActive: false }] })
      });

      expect(component.acceptingBookings).toBeTrue();
      expect(bookButtons(el).length).toBe(1);
      expect(el.querySelector('app-sticky-book-bar')).not.toBeNull();
    });

    it('is not offered when the center has no weekly hours -- the button, bottom call to action and sticky bar all go', () => {
      const el = setup({ slug: 'iron-works', centers: [ironWorks], availability: of({ data: [] }) });

      expect(component.acceptingBookings).toBeFalse();
      expect(bookButtons(el).length).toBe(0);
      expect(el.querySelector('app-sticky-book-bar')).toBeNull();
      expect(el.querySelector('app-profile-cta')).toBeNull();
      expect(el.textContent).toContain("Online booking isn't open for this center yet");
    });

    it('is not offered when every day is switched off', () => {
      setup({ slug: 'iron-works', centers: [ironWorks], availability: of({ data: [{ dayOfWeek: 1, isActive: false }] }) });

      expect(component.acceptingBookings).toBeFalse();
    });

    it('stays offered when the hours could not be checked, rather than taking booking away on a hiccup', () => {
      const el = setup({ slug: 'iron-works', centers: [ironWorks], availability: throwError(() => new Error('boom')) });

      expect(component.acceptingBookings).toBeNull();
      expect(bookButtons(el).length).toBe(1);
    });
  });
});
