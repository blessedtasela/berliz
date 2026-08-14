import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SubscriptionState } from './subscription.state';
import { subscriptionFeatureKey } from './subscription.reducer';

const selectState = createFeatureSelector<SubscriptionState>(subscriptionFeatureKey);

export const selectSubscriptionLoading = createSelector(selectState, s => s.loading);
export const selectSubscriptionError   = createSelector(selectState, s => s.error);
export const selectSubscriptionMessage = createSelector(selectState, s => s.lastMessage);

export const selectSubscriptions        = createSelector(selectState, s => s.subscriptions);
export const selectActiveSubscriptions  = createSelector(selectState, s => s.activeSubscriptions);
export const selectMySubscriptions      = createSelector(selectState, s => s.mySubscriptions);
export const selectSelectedSubscription = createSelector(selectState, s => s.selectedSubscription);
export const selectPlanSelectionResult  = createSelector(selectState, s => s.planSelection);
