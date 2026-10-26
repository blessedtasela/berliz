import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CenterDetailComponent } from './center-detail.component';
import { CenterService } from 'src/app/services/center.service';
import { AvailabilityService } from 'src/app/services/availability.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TestimonialDialogService } from 'src/app/testimonial/testimonial-dialog.service';
import { BookingLauncherService } from 'src/app/booking/booking-launcher.service';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';
import { selectActiveCenters } from 'src/app/state/center/center.selectors';

/** A mistyped /centers/:name must never dead-end: suggest the closest center, or land on the directory. */
describe('CenterDetailComponent unknown center slug', () => {
  let router: jasmine.SpyObj<Router>;
  let snack: jasmine.SpyObj<SnackBarService>;
  let store: MockStore;

  const centers = [{ id: 3, name: 'M Fitness Sources' }, { id: 4, name: 'Berliz Works' }] as any[];

  function open(slug: string) {
    router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    snack = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const centerService = jasmine.createSpyObj('CenterService', [
      'getIntroductionsByCenterId', 'getLocationsByCenterId', 'getEquipmentByCenterId', 'getPricingByCenterId',
      'getPhotoAlbumsByCenterId', 'getVideoAlbumsByCenterId', 'getCenterTrainersByCenterId',
    ]);
    Object.keys(centerService).forEach(k => centerService[k].and.returnValue(of(null)));

    TestBed.configureTestingModule({
      declarations: [CenterDetailComponent],
      imports: [StrapiUrlPipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({ selectors: [{ selector: selectActiveCenters, value: centers }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ name: slug })), snapshot: { queryParamMap: convertToParamMap({}) } } },
        { provide: Router, useValue: router },
        { provide: SnackBarService, useValue: snack },
        { provide: CenterService, useValue: centerService },
        { provide: AvailabilityService, useValue: { getProviderAvailability: () => of({ data: [{ isActive: true }] }) } },
        { provide: TestimonialDialogService, useValue: jasmine.createSpyObj('TestimonialDialogService', ['openTestimonialForm']) },
        { provide: BookingLauncherService, useValue: jasmine.createSpyObj('BookingLauncherService', ['startBooking', 'startLevelUp']) },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
      ],
    });
    store = TestBed.inject(MockStore);
    const fixture = TestBed.createComponent(CenterDetailComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => store?.resetSelectors());

  it('suggests the closest center for a typo and does not redirect', () => {
    const c = open('berliz-wroks');
    expect(c.notFound).toBeTrue();
    expect(c.suggestion?.name).toBe('Berliz Works');
    expect(c.suggestionLink()).toEqual(['/centers', 'berliz-works']);
    expect(router.navigate).not.toHaveBeenCalledWith(['/centers'], jasmine.anything());
  });

  it('sends the visitor to the centers directory when nothing is close', () => {
    const c = open('zzzz-qqqq');
    expect(c.suggestion).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/centers'], { replaceUrl: true });
    expect(snack.openSnackBar).toHaveBeenCalled();
  });

  it('does nothing special for a real center', () => {
    const c = open('berliz-works');
    expect(c.notFound).toBeFalse();
    expect(c.suggestion).toBeNull();
  });
});
