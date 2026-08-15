import { createReducer, on } from '@ngrx/store';
import * as A from './payout.actions';
import { initialPayoutState } from './payout.state';

export const payoutFeatureKey = 'payout';

function upsert<T extends { id?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [...list, item];
}

export const payoutReducer = createReducer(
  initialPayoutState,

  on(A.loadMyPayouts, A.loadAllPayouts, A.payOutViaStripe, state => ({ ...state, loading: true, error: null })),

  on(
    A.loadMyPayoutsFailure, A.loadAllPayoutsFailure, A.payOutViaStripeFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadMyPayoutsSuccess, (s, { response }) => ({
    ...s, loading: false, myPayouts: response.data ?? []
  })),

  on(A.loadAllPayoutsSuccess, (s, { response }) => ({
    ...s, loading: false, allPayouts: response.data ?? []
  })),

  on(A.payOutViaStripeSuccess, (s, { response }) => ({
    ...s, loading: false,
    myPayouts: response.data ? upsert(s.myPayouts, response.data) : s.myPayouts,
    allPayouts: response.data ? upsert(s.allPayouts, response.data) : s.allPayouts,
  })),
);
