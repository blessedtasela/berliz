import { createReducer, on } from '@ngrx/store';
import * as A from './plan.actions';
import { initialPlanState } from './plan.state';

export const planFeatureKey = 'plan';

export const planReducer = createReducer(
  initialPlanState,

  on(A.loadPlans, state => ({ ...state, loading: true, error: null })),

  on(A.loadPlansFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(A.loadPlansSuccess, (s, { response }) => ({
    ...s, loading: false, plans: response.data ?? []
  })),
);
