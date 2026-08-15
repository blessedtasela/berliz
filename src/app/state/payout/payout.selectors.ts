import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PayoutState } from './payout.state';
import { payoutFeatureKey } from './payout.reducer';

const selectState = createFeatureSelector<PayoutState>(payoutFeatureKey);

export const selectPayoutLoading = createSelector(selectState, s => s.loading);
export const selectPayoutError = createSelector(selectState, s => s.error);

export const selectMyPayouts = createSelector(selectState, s => s.myPayouts);
export const selectAllPayouts = createSelector(selectState, s => s.allPayouts);

/** Sum of payoutAmount across PENDING rows — what you're owed but haven't been paid yet. */
export const selectMyPendingTotal = createSelector(selectMyPayouts, payouts =>
  payouts.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + (p.payoutAmount ?? 0), 0)
);

/** Sum of payoutAmount across PAID rows — lifetime earnings actually sent. */
export const selectMyPaidTotal = createSelector(selectMyPayouts, payouts =>
  payouts.filter(p => p.status === 'PAID').reduce((sum, p) => sum + (p.payoutAmount ?? 0), 0)
);
