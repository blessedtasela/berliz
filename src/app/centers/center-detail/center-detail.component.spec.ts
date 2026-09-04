import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CenterDetailComponent } from './center-detail.component';
import { CenterService } from 'src/app/services/center.service';
import { TestimonialDialogService } from 'src/app/testimonial/testimonial-dialog.service';
import { BookingDialogService } from 'src/app/booking/booking-dialog.service';

describe('CenterDetailComponent', () => {
  let component: CenterDetailComponent;
  let fixture: ComponentFixture<CenterDetailComponent>;

  beforeEach(() => {
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
    const testimonialDialogSpy = jasmine.createSpyObj('TestimonialDialogService', ['openTestimonialForm']);
    const bookingDialogSpy = jasmine.createSpyObj('BookingDialogService', ['openBookingForm']);

    TestBed.configureTestingModule({
      declarations: [CenterDetailComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({})),
            snapshot: { queryParamMap: convertToParamMap({}) }
          }
        },
        { provide: Router, useValue: routerSpy },
        { provide: CenterService, useValue: centerServiceSpy },
        { provide: TestimonialDialogService, useValue: testimonialDialogSpy },
        { provide: BookingDialogService, useValue: bookingDialogSpy }
      ]
    });
    fixture = TestBed.createComponent(CenterDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
