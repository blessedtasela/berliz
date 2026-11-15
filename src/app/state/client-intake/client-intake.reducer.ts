import { createReducer, on } from '@ngrx/store';
import * as A from './client-intake.actions';
import { initialClientIntakeState } from './client-intake.state';

export const clientIntakeFeatureKey = 'clientIntake';

function upsert<T extends { id?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [...list, item];
}

export const clientIntakeReducer = createReducer(
  initialClientIntakeState,

  on(
    A.sendClientIntake, A.loadClientIntake, A.saveClientIntakeDraft, A.signClientIntake, A.loadMyClientIntakes,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.sendClientIntakeFailure, A.loadClientIntakeFailure, A.saveClientIntakeDraftFailure, A.signClientIntakeFailure, A.loadMyClientIntakesFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.sendClientIntakeSuccess, (s, { response }) => ({
    ...s, loading: false,
    selectedIntake: response.data ?? s.selectedIntake,
    myIntakes: response.data ? upsert(s.myIntakes, response.data) : s.myIntakes,
  })),

  on(A.loadClientIntakeSuccess, (s, { response }) => ({
    ...s, loading: false, selectedIntake: response.data ?? null
  })),

  on(A.saveClientIntakeDraftSuccess, A.signClientIntakeSuccess, (s, { response }) => ({
    ...s, loading: false,
    selectedIntake: response.data ?? s.selectedIntake,
    myIntakes: response.data ? upsert(s.myIntakes, response.data) : s.myIntakes,
  })),

  on(A.loadMyClientIntakesSuccess, (s, { response }) => ({
    ...s, loading: false, myIntakes: response.data ?? []
  })),

  on(A.clearSelectedClientIntake, s => ({ ...s, selectedIntake: null, error: null })),
);
