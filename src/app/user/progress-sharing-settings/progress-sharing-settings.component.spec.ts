import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs';

import { ProgressSharingSettingsComponent } from './progress-sharing-settings.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectMyTrainersLoading, selectMyTrainersOnly } from 'src/app/state/booking/booking.selectors';
import { selectMyGrants, selectProgressShareLoading } from 'src/app/state/progress-share/progress-share.selectors';
import { grantProgressShare, revokeProgressShare, grantProgressShareSuccess } from 'src/app/state/progress-share/progress-share.actions';
import { MyTrainerSummary, ProgressShare } from 'src/app/models/progress-share.model';

describe('ProgressSharingSettingsComponent', () => {
  let component: ProgressSharingSettingsComponent;
  let fixture: ComponentFixture<ProgressSharingSettingsComponent>;
  let store: MockStore;
  let actions$: Subject<any>;
  let snackBarSpy: jasmine.SpyObj<SnackBarService>;

  const trainers: MyTrainerSummary[] = [
    { type: 'trainer', id: 1, name: 'Trainer One', status: 'confirmed', lastBookingAt: new Date(), bookingCount: 2 },
    { type: 'trainer', id: 2, name: 'Trainer Two', status: 'pending', lastBookingAt: new Date(), bookingCount: 1 },
  ];

  const activeGrant: ProgressShare = {
    id: 10, clientId: 5, clientFirstname: 'A', clientLastname: 'B', clientEmail: 'a@b.com',
    trainerId: 1, trainerName: 'Trainer One',
    grantedAt: new Date(), revokedAt: null, isActive: true,
    date: new Date(), lastUpdate: new Date(),
  };

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    actions$ = new Subject();

    TestBed.configureTestingModule({
      declarations: [ProgressSharingSettingsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectMyTrainersOnly, value: trainers },
            { selector: selectMyTrainersLoading, value: false },
            { selector: selectMyGrants, value: [activeGrant] },
            { selector: selectProgressShareLoading, value: false },
          ]
        }),
        { provide: Actions, useValue: actions$ },
        { provide: SnackBarService, useValue: snackBarSpy },
      ]
    });

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();

    fixture = TestBed.createComponent(ProgressSharingSettingsComponent);
    component = fixture.componentInstance;
  });

  it('loads trainer-only trainers from the my-trainers store and marks trainer 1 as shared from selectMyGrants', () => {
    fixture.detectChanges();

    expect(component.trainers).toEqual(trainers);
    expect(component.isShared(1)).toBeTrue();
    expect(component.isShared(2)).toBeFalse();
  });

  it('toggleSharing dispatches revokeProgressShare when the trainer already has an active grant', () => {
    fixture.detectChanges();

    component.toggleSharing(trainers[0]);

    expect(store.dispatch).toHaveBeenCalledWith(revokeProgressShare({ trainerId: 1 }));
    expect(component.savingTrainerId).toBe(1);
  });

  it('toggleSharing dispatches grantProgressShare when the trainer has no active grant', () => {
    fixture.detectChanges();

    component.toggleSharing(trainers[1]);

    expect(store.dispatch).toHaveBeenCalledWith(grantProgressShare({ trainerId: 2 }));
    expect(component.savingTrainerId).toBe(2);
  });

  it('ignores a second toggle while a grant/revoke call for another trainer is still in flight', () => {
    fixture.detectChanges();

    component.toggleSharing(trainers[1]); // starts saving trainer 2
    (store.dispatch as jasmine.Spy).calls.reset();

    component.toggleSharing(trainers[0]); // should be ignored — a save is already in flight

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('clears savingTrainerId and shows a snackbar when a grant succeeds', () => {
    fixture.detectChanges();
    component.savingTrainerId = 2;

    actions$.next(grantProgressShareSuccess({
      response: { message: 'Access granted', data: activeGrant, success: true, statusCode: 200 }
    }));

    expect(component.savingTrainerId).toBeNull();
    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('Access granted', '');
  });
});
