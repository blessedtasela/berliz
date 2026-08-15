import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { ProgressShareEffects } from './progress-share.effects';
import { ProgressShareService } from '../../services/progress-share.service';
import * as A from './progress-share.actions';
import { ApiResponse } from '../../models/Api.interface';
import { ProgressShare, ClientProgress } from '../../models/progress-share.model';

describe('ProgressShareEffects', () => {
  let actions$: Observable<any>;
  let effects: ProgressShareEffects;
  let serviceSpy: jasmine.SpyObj<ProgressShareService>;

  const sampleShare: ProgressShare = {
    id: 1, clientId: 5, clientFirstname: 'Jane', clientLastname: 'Doe', clientEmail: 'jane@doe.com',
    trainerId: 9, trainerName: 'Coach Sam',
    grantedAt: new Date(), revokedAt: null, isActive: true,
    date: new Date(), lastUpdate: new Date(),
  };

  const sampleProgress: ClientProgress = {
    clientId: 5, clientFirstname: 'Jane', clientLastname: 'Doe', clientEmail: 'jane@doe.com',
    assignments: []
  };

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj('ProgressShareService', [
      'grant', 'revoke', 'getMyGrants', 'getSharedWithMe', 'getClientProgress'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProgressShareEffects,
        provideMockActions(() => actions$),
        { provide: ProgressShareService, useValue: serviceSpy }
      ]
    });

    effects = TestBed.inject(ProgressShareEffects);
  });

  it('grantProgressShare$ dispatches grantProgressShareSuccess with the share returned by the service', async () => {
    const response: ApiResponse<ProgressShare> = { message: 'Access granted', data: sampleShare, success: true, statusCode: 200 };
    serviceSpy.grant.and.returnValue(of(response));
    actions$ = of(A.grantProgressShare({ trainerId: 9 }));

    const result = await firstValueFrom(effects.grantProgressShare$);

    expect(result).toEqual(A.grantProgressShareSuccess({ response }));
    expect(serviceSpy.grant).toHaveBeenCalledWith(9);
  });

  it('grantProgressShare$ dispatches grantProgressShareFailure with the server message on error', async () => {
    serviceSpy.grant.and.returnValue(throwError(() => ({ error: { message: 'Trainer not found' } })));
    actions$ = of(A.grantProgressShare({ trainerId: 9 }));

    const result = await firstValueFrom(effects.grantProgressShare$);

    expect(result).toEqual(A.grantProgressShareFailure({ error: 'Trainer not found' }));
  });

  it('revokeProgressShare$ dispatches revokeProgressShareSuccess carrying the trainerId for reducer bookkeeping', async () => {
    const response: ApiResponse<ProgressShare> = { message: 'Access revoked', data: sampleShare, success: true, statusCode: 200 };
    serviceSpy.revoke.and.returnValue(of(response));
    actions$ = of(A.revokeProgressShare({ trainerId: 9 }));

    const result = await firstValueFrom(effects.revokeProgressShare$);

    expect(result).toEqual(A.revokeProgressShareSuccess({ response, trainerId: 9 }));
  });

  it('revokeProgressShare$ falls back to a generic error message when the server sends none', async () => {
    serviceSpy.revoke.and.returnValue(throwError(() => ({})));
    actions$ = of(A.revokeProgressShare({ trainerId: 9 }));

    const result = await firstValueFrom(effects.revokeProgressShare$);

    expect(result).toEqual(A.revokeProgressShareFailure({ error: 'Failed to revoke access' }));
  });

  it('loadMyGrants$ dispatches loadMyGrantsSuccess with the grants returned by the service', async () => {
    const response: ApiResponse<ProgressShare[]> = { message: 'ok', data: [sampleShare], success: true, statusCode: 200 };
    serviceSpy.getMyGrants.and.returnValue(of(response));
    actions$ = of(A.loadMyGrants());

    const result = await firstValueFrom(effects.loadMyGrants$);

    expect(result).toEqual(A.loadMyGrantsSuccess({ response }));
  });

  it('loadSharedWithMe$ dispatches loadSharedWithMeSuccess with the clients returned by the service', async () => {
    const response: ApiResponse<ProgressShare[]> = { message: 'ok', data: [sampleShare], success: true, statusCode: 200 };
    serviceSpy.getSharedWithMe.and.returnValue(of(response));
    actions$ = of(A.loadSharedWithMe());

    const result = await firstValueFrom(effects.loadSharedWithMe$);

    expect(result).toEqual(A.loadSharedWithMeSuccess({ response }));
  });

  it('loadSharedWithMe$ dispatches loadSharedWithMeFailure with a 403-style access message on error', async () => {
    serviceSpy.getSharedWithMe.and.returnValue(throwError(() => ({ error: { message: 'Trainer profile not found' } })));
    actions$ = of(A.loadSharedWithMe());

    const result = await firstValueFrom(effects.loadSharedWithMe$);

    expect(result).toEqual(A.loadSharedWithMeFailure({ error: 'Trainer profile not found' }));
  });

  it('loadClientProgress$ dispatches loadClientProgressSuccess with the progress returned by the service', async () => {
    const response: ApiResponse<ClientProgress> = { message: 'ok', data: sampleProgress, success: true, statusCode: 200 };
    serviceSpy.getClientProgress.and.returnValue(of(response));
    actions$ = of(A.loadClientProgress({ clientId: 5 }));

    const result = await firstValueFrom(effects.loadClientProgress$);

    expect(result).toEqual(A.loadClientProgressSuccess({ response }));
    expect(serviceSpy.getClientProgress).toHaveBeenCalledWith(5);
  });

  it('loadClientProgress$ dispatches loadClientProgressFailure with the 403 access-denied message', async () => {
    serviceSpy.getClientProgress.and.returnValue(
      throwError(() => ({ error: { message: 'This client has not shared their progress with you.' } }))
    );
    actions$ = of(A.loadClientProgress({ clientId: 5 }));

    const result = await firstValueFrom(effects.loadClientProgress$);

    expect(result).toEqual(A.loadClientProgressFailure({ error: 'This client has not shared their progress with you.' }));
  });
});
