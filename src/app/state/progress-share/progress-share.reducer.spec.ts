import { progressShareReducer } from './progress-share.reducer';
import { initialProgressShareState } from './progress-share.state';
import * as A from './progress-share.actions';
import { ApiResponse } from '../../models/Api.interface';
import { ProgressShare } from '../../models/progress-share.model';

describe('Progress Share Reducer', () => {

  const share: ProgressShare = {
    id: 1, clientId: 5, clientFirstname: 'Jane', clientLastname: 'Doe', clientEmail: 'jane@doe.com',
    trainerId: 9, trainerName: 'Coach Sam',
    grantedAt: new Date(), revokedAt: null, isActive: true,
    date: new Date(), lastUpdate: new Date(),
  };

  describe('an unknown action', () => {
    it('returns the previous state', () => {
      const result = progressShareReducer(initialProgressShareState, {} as any);
      expect(result).toBe(initialProgressShareState);
    });
  });

  describe('grantProgressShareSuccess', () => {
    it('adds the newly-granted trainer to myGrants', () => {
      const response: ApiResponse<ProgressShare> = { message: 'ok', data: share, success: true, statusCode: 200 };

      const result = progressShareReducer(initialProgressShareState, A.grantProgressShareSuccess({ response }));

      expect(result.myGrants).toEqual([share]);
      expect(result.loading).toBeFalse();
    });

    it('replaces the existing row for the same trainer rather than duplicating it', () => {
      const seeded = { ...initialProgressShareState, myGrants: [share] };
      const updated: ProgressShare = { ...share, grantedAt: new Date(2030, 0, 1) };
      const response: ApiResponse<ProgressShare> = { message: 'ok', data: updated, success: true, statusCode: 200 };

      const result = progressShareReducer(seeded, A.grantProgressShareSuccess({ response }));

      expect(result.myGrants.length).toBe(1);
      expect(result.myGrants[0]).toEqual(updated);
    });
  });

  describe('revokeProgressShareSuccess', () => {
    it('removes the trainer from myGrants', () => {
      const seeded = { ...initialProgressShareState, myGrants: [share] };
      const response: ApiResponse<ProgressShare> = { message: 'ok', data: { ...share, isActive: false }, success: true, statusCode: 200 };

      const result = progressShareReducer(seeded, A.revokeProgressShareSuccess({ response, trainerId: 9 }));

      expect(result.myGrants).toEqual([]);
    });
  });

  describe('loadSharedWithMeSuccess', () => {
    it('populates sharedWithMe from the response', () => {
      const response: ApiResponse<ProgressShare[]> = { message: 'ok', data: [share], success: true, statusCode: 200 };

      const result = progressShareReducer(initialProgressShareState, A.loadSharedWithMeSuccess({ response }));

      expect(result.sharedWithMe).toEqual([share]);
    });
  });

  describe('loadClientProgress lifecycle', () => {
    it('sets loadingClientProgress while in flight, then clears it on success', () => {
      const inFlight = progressShareReducer(initialProgressShareState, A.loadClientProgress({ clientId: 5 }));
      expect(inFlight.loadingClientProgress).toBeTrue();

      const progress = { clientId: 5, clientFirstname: 'Jane', clientLastname: 'Doe', clientEmail: 'jane@doe.com', assignments: [] };
      const response: ApiResponse<any> = { message: 'ok', data: progress, success: true, statusCode: 200 };
      const done = progressShareReducer(inFlight, A.loadClientProgressSuccess({ response }));

      expect(done.loadingClientProgress).toBeFalse();
      expect(done.selectedClientProgress).toEqual(progress);
    });

    it('clearSelectedClientProgress resets the detail panel', () => {
      const seeded = { ...initialProgressShareState, selectedClientProgress: { clientId: 5 } as any };

      const result = progressShareReducer(seeded, A.clearSelectedClientProgress());

      expect(result.selectedClientProgress).toBeNull();
    });
  });
});
