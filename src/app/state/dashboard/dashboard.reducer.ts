import { createReducer, on } from '@ngrx/store';
import * as A from './dashboard.actions';
import { initialDashboardState } from './dashboard.state';

export const dashboardFeatureKey = 'dashboard';

export const dashboardReducer = createReducer(
  initialDashboardState,

  on(A.loadDashboard, state => ({ ...state, loading: true, error: null })),

  on(A.loadDashboardFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(A.loadDashboardSuccess, (s, { data }) => ({
    ...s, loading: false, data: data ?? null
  })),
);
