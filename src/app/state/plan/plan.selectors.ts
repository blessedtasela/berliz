import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlanState } from './plan.state';
import { planFeatureKey } from './plan.reducer';

const selectState = createFeatureSelector<PlanState>(planFeatureKey);

export const selectPlanLoading = createSelector(selectState, s => s.loading);
export const selectPlanError = createSelector(selectState, s => s.error);

export const selectPlans = createSelector(selectState, s => s.plans);
