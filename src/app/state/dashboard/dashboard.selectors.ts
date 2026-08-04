import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardState } from './dashboard.state';
import { dashboardFeatureKey } from './dashboard.reducer';

const selectState = createFeatureSelector<DashboardState>(dashboardFeatureKey);

export const selectDashboardLoading = createSelector(selectState, s => s.loading);
export const selectDashboardError   = createSelector(selectState, s => s.error);
export const selectDashboardData    = createSelector(selectState, s => s.data);
