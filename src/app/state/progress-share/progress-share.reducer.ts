import { createReducer, on } from '@ngrx/store';
import * as A from './progress-share.actions';
import { initialProgressShareState } from './progress-share.state';

export const progressShareFeatureKey = 'progressShare';

function upsert<T extends { trainerId?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.trainerId === item.trainerId);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [...list, item];
}

export const progressShareReducer = createReducer(
  initialProgressShareState,

  on(
    A.grantProgressShare, A.revokeProgressShare, A.loadMyGrants, A.loadSharedWithMe,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.grantProgressShareFailure, A.revokeProgressShareFailure,
    A.loadMyGrantsFailure, A.loadSharedWithMeFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  // A grant only ever affects myGrants — the client's own list of who they've shared with.
  on(A.grantProgressShareSuccess, (s, { response }) => ({
    ...s, loading: false,
    myGrants: response.data ? upsert(s.myGrants, response.data) : s.myGrants,
  })),

  // A revoke keeps the row (isActive: false) rather than removing it, matching the backend,
  // but the settings UI only ever needs to show ACTIVE grants, so drop it from the list here.
  on(A.revokeProgressShareSuccess, (s, { trainerId }) => ({
    ...s, loading: false,
    myGrants: s.myGrants.filter(g => g.trainerId !== trainerId),
  })),

  on(A.loadMyGrantsSuccess, (s, { response }) => ({
    ...s, loading: false, myGrants: response.data ?? []
  })),

  on(A.loadSharedWithMeSuccess, (s, { response }) => ({
    ...s, loading: false, sharedWithMe: response.data ?? []
  })),

  on(A.loadClientProgress, state => ({ ...state, loadingClientProgress: true, error: null })),

  on(A.loadClientProgressSuccess, (s, { response }) => ({
    ...s, loadingClientProgress: false, selectedClientProgress: response.data ?? null
  })),

  on(A.loadClientProgressFailure, (s, { error }) => ({
    ...s, loadingClientProgress: false, error
  })),

  on(A.clearSelectedClientProgress, s => ({ ...s, selectedClientProgress: null })),
);
