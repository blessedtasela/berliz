import { createReducer, on } from '@ngrx/store';
import * as A from './progress-entry.actions';
import { initialProgressEntryState } from './progress-entry.state';

export const progressEntryFeatureKey = 'progressEntry';

function upsert<T extends { id?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [item, ...list];
}

export const progressEntryReducer = createReducer(
  initialProgressEntryState,

  on(
    A.createProgressEntry, A.updateProgressEntry, A.deleteProgressEntry,
    A.addProgressEntryPhoto, A.removeProgressEntryPhoto, A.loadMyProgressEntries,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.createProgressEntryFailure, A.updateProgressEntryFailure, A.deleteProgressEntryFailure,
    A.addProgressEntryPhotoFailure, A.removeProgressEntryPhotoFailure, A.loadMyProgressEntriesFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.createProgressEntrySuccess, (s, { response }) => ({
    ...s, loading: false,
    myEntries: response.data ? upsert(s.myEntries, response.data) : s.myEntries,
  })),

  on(A.updateProgressEntrySuccess, A.addProgressEntryPhotoSuccess, A.removeProgressEntryPhotoSuccess, (s, { response }) => ({
    ...s, loading: false,
    myEntries: response.data ? upsert(s.myEntries, response.data) : s.myEntries,
  })),

  on(A.deleteProgressEntrySuccess, (s, { entryId }) => ({
    ...s, loading: false,
    myEntries: s.myEntries.filter(e => e.id !== entryId),
  })),

  on(A.loadMyProgressEntriesSuccess, (s, { response }) => ({
    ...s, loading: false, myEntries: response.data ?? []
  })),

  on(A.loadClientProgressEntries, state => ({ ...state, loadingClientEntries: true, error: null })),

  on(A.loadClientProgressEntriesSuccess, (s, { response }) => ({
    ...s, loadingClientEntries: false, selectedClientEntries: response.data ?? []
  })),

  on(A.loadClientProgressEntriesFailure, (s, { error }) => ({
    ...s, loadingClientEntries: false, error
  })),

  on(A.clearSelectedClientProgressEntries, s => ({ ...s, selectedClientEntries: null })),
);
