import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject, of, throwError } from 'rxjs';

import { MyAvailabilityEditorComponent } from './my-availability-editor.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectAvailabilityLoading, selectMyAvailability } from 'src/app/state/availability/availability.selectors';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MyAvailabilityEditorComponent', () => {
  let component: MyAvailabilityEditorComponent;
  let fixture: ComponentFixture<MyAvailabilityEditorComponent>;

  beforeEach(() => {
    const snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
    declarations: [MyAvailabilityEditorComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [],
    providers: [
        provideMockStore({
            selectors: [
                { selector: selectAvailabilityLoading, value: false },
                { selector: selectMyAvailability, value: [] }
            ]
        }),
        { provide: Actions, useValue: new Subject() },
        { provide: SnackBarService, useValue: snackBarSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});

    fixture = TestBed.createComponent(MyAvailabilityEditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('timezone', () => {
    it('starts from the browser zone, and offers a list that includes it', () => {
      spyOn(Intl, 'DateTimeFormat').and.returnValue({ resolvedOptions: () => ({ timeZone: 'America/Vancouver' }) } as any);
      fixture.detectChanges();
      expect(component.timezone).toBe('America/Vancouver');
      expect(component.timezones).toContain(component.timezone);
    });

    it('makes the trainer pick a zone when the browser reports none, and will not save without one', () => {
      spyOn(Intl, 'DateTimeFormat').and.returnValue({ resolvedOptions: () => ({ timeZone: undefined }) } as any);
      const store = TestBed.inject(MockStore);
      const dispatch = spyOn(store, 'dispatch');
      fixture.detectChanges();
      expect(component.timezone).toBe('');

      component.save();

      expect(component.submitError).toContain('timezone');
      expect(dispatch.calls.allArgs().some(a => (a[0] as any).type === '[Availability] Set Mine')).toBeFalse();
    });

    it('shows the zone the trainer saved, even if this device is somewhere else', () => {
      const store = TestBed.inject(MockStore);
      store.overrideSelector(selectMyAvailability, [{ id: 1, dayOfWeek: 1, startTime: '09:00:00', endTime: '17:00:00', isActive: true, timezone: 'Pacific/Auckland' } as any]);
      fixture.detectChanges();
      expect(component.timezone).toBe('Pacific/Auckland');
      expect(component.timezones).toContain('Pacific/Auckland');
    });

    it('saves the zone the trainer picked, not the one the browser reports', () => {
      const store = TestBed.inject(MockStore);
      const dispatch = spyOn(store, 'dispatch');
      fixture.detectChanges();
      component.timezone = 'Africa/Casablanca';

      component.save();

      const saved = dispatch.calls.allArgs().map(a => a[0] as any).find(a => a.type === '[Availability] Set Mine');
      expect(saved).toBeDefined();
      expect(saved.timezone).toBe('Africa/Casablanca');
    });
  });

  describe('referral bookings', () => {
    let svc: any;
    beforeEach(() => { svc = (component as any).availabilityService; });

    it('starts from what the provider chose, and is on unless they opted out', () => {
      spyOn(svc, 'getMyAcceptingReferrals').and.returnValue(of({ data: false } as any));
      fixture.detectChanges();
      expect(component.acceptingReferrals).toBeFalse();
      expect(component.referralsLoading).toBeFalse();
    });

    it('opts out straight away and says so', () => {
      spyOn(svc, 'getMyAcceptingReferrals').and.returnValue(of({ data: true } as any));
      const save = spyOn(svc, 'setMyAcceptingReferrals').and.returnValue(of({ data: false, message: 'Opted out of referral bookings' } as any));
      const snack = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;
      fixture.detectChanges();

      component.setAcceptingReferrals(false);

      expect(save).toHaveBeenCalledWith(false);
      expect(component.acceptingReferrals).toBeFalse();
      expect(snack.openSnackBar).toHaveBeenCalledWith('Opted out of referral bookings', '');
    });

    it('puts the switch back and shows the reason when the server refuses', () => {
      spyOn(svc, 'getMyAcceptingReferrals').and.returnValue(of({ data: true } as any));
      spyOn(svc, 'setMyAcceptingReferrals').and.returnValue(throwError(() => ({ error: { message: 'Only trainers and centers can do that.' } })));
      fixture.detectChanges();

      component.setAcceptingReferrals(false);

      expect(component.acceptingReferrals).toBeTrue();
      expect(component.referralsError).toBe('Only trainers and centers can do that.');
    });

    it('ignores a second tap while saving', () => {
      spyOn(svc, 'getMyAcceptingReferrals').and.returnValue(of({ data: true } as any));
      const save = spyOn(svc, 'setMyAcceptingReferrals').and.returnValue(new Subject() as any);
      fixture.detectChanges();
      component.setAcceptingReferrals(false);
      component.setAcceptingReferrals(true);
      expect(save).toHaveBeenCalledTimes(1);
    });
  });
});
