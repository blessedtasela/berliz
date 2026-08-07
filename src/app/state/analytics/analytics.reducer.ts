import { createReducer, on } from '@ngrx/store';
import * as A from './analytics.actions';
import { initialAnalyticsState } from './analytics.state';

export const analyticsFeatureKey = 'analytics';

export const analyticsReducer = createReducer(
  initialAnalyticsState,

  on(
    A.loadLoginStats, A.loadMyLoginHistory,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.loadLoginStatsFailure, A.loadMyLoginHistoryFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadLoginStatsSuccess, (s, { data }) => ({
    ...s, loading: false, loginStats: data ?? null
  })),

  on(A.loadMyLoginHistorySuccess, (s, { data }) => ({
    ...s, loading: false, myLoginHistory: data ?? []
  })),
);
