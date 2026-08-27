import { progressEntryReducer } from './progress-entry.reducer';
import { initialProgressEntryState } from './progress-entry.state';
import * as A from './progress-entry.actions';
import { ApiResponse } from '../../models/Api.interface';
import { ProgressEntry } from '../../models/progress-entry.model';

describe('Progress Entry Reducer', () => {

  const entry: ProgressEntry = {
    id: 1, clientId: 5, weightKg: 82.5, bodyFatPercent: 18, photos: [],
    date: new Date(), lastUpdate: new Date(),
  };

  describe('an unknown action', () => {
    it('returns the previous state', () => {
      const result = progressEntryReducer(initialProgressEntryState, {} as any);
      expect(result).toBe(initialProgressEntryState);
    });
  });

  describe('createProgressEntrySuccess', () => {
    it('adds the new entry to the front of myEntries', () => {
      const response: ApiResponse<ProgressEntry> = { message: 'ok', data: entry, success: true, statusCode: 200 };

      const result = progressEntryReducer(initialProgressEntryState, A.createProgressEntrySuccess({ response }));

      expect(result.myEntries).toEqual([entry]);
      expect(result.loading).toBeFalse();
    });
  });

  describe('updateProgressEntrySuccess', () => {
    it('replaces the existing row for the same entry id rather than duplicating it', () => {
      const seeded = { ...initialProgressEntryState, myEntries: [entry] };
      const updated: ProgressEntry = { ...entry, weightKg: 80 };
      const response: ApiResponse<ProgressEntry> = { message: 'ok', data: updated, success: true, statusCode: 200 };

      const result = progressEntryReducer(seeded, A.updateProgressEntrySuccess({ response }));

      expect(result.myEntries.length).toBe(1);
      expect(result.myEntries[0].weightKg).toBe(80);
    });
  });

  describe('deleteProgressEntrySuccess', () => {
    it('removes the entry from myEntries', () => {
      const seeded = { ...initialProgressEntryState, myEntries: [entry] };
      const response: ApiResponse<ProgressEntry> = { message: 'ok', data: entry, success: true, statusCode: 200 };

      const result = progressEntryReducer(seeded, A.deleteProgressEntrySuccess({ response, entryId: 1 }));

      expect(result.myEntries).toEqual([]);
    });
  });

  describe('loadMyProgressEntriesSuccess', () => {
    it('populates myEntries from the response', () => {
      const response: ApiResponse<ProgressEntry[]> = { message: 'ok', data: [entry], success: true, statusCode: 200 };

      const result = progressEntryReducer(initialProgressEntryState, A.loadMyProgressEntriesSuccess({ response }));

      expect(result.myEntries).toEqual([entry]);
    });
  });

  describe('loadClientProgressEntries lifecycle', () => {
    it('sets loadingClientEntries while in flight, then clears it on success', () => {
      const inFlight = progressEntryReducer(initialProgressEntryState, A.loadClientProgressEntries({ clientId: 5 }));
      expect(inFlight.loadingClientEntries).toBeTrue();

      const response: ApiResponse<ProgressEntry[]> = { message: 'ok', data: [entry], success: true, statusCode: 200 };
      const done = progressEntryReducer(inFlight, A.loadClientProgressEntriesSuccess({ response }));

      expect(done.loadingClientEntries).toBeFalse();
      expect(done.selectedClientEntries).toEqual([entry]);
    });

    it('clearSelectedClientProgressEntries resets the detail panel', () => {
      const seeded = { ...initialProgressEntryState, selectedClientEntries: [entry] };

      const result = progressEntryReducer(seeded, A.clearSelectedClientProgressEntries());

      expect(result.selectedClientEntries).toBeNull();
    });
  });
});
