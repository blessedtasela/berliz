import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AnalyticsState } from './analytics.state';
import { analyticsFeatureKey } from './analytics.reducer';

const selectState = createFeatureSelector<AnalyticsState>(analyticsFeatureKey);

export const selectAnalyticsLoading = createSelector(selectState, s => s.loading);
export const selectAnalyticsError   = createSelector(selectState, s => s.error);

export const selectLoginStats     = createSelector(selectState, s => s.loginStats);
export const selectMyLoginHistory = createSelector(selectState, s => s.myLoginHistory);

/** Device split as an ordered array, ready for a stat row / mini chart. */
export const selectDeviceBreakdown = createSelector(selectLoginStats, stats => {
  const breakdown = stats?.deviceBreakdown ?? {};
  return ['desktop', 'mobile', 'tablet', 'unknown']
    .map(key => ({ key, count: breakdown[key] ?? 0 }))
    .filter(bucket => bucket.count > 0);
});
