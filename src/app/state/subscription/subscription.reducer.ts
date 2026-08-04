import { createReducer, on } from '@ngrx/store';
import * as A from './subscription.actions';
import { initialSubscriptionState } from './subscription.state';

export const subscriptionFeatureKey = 'subscription';

export const subscriptionReducer = createReducer(
  initialSubscriptionState,

  on(
    A.loadSubscriptions, A.loadActiveSubscriptions, A.loadMySubscriptions, A.loadSubscription,
    A.addSubscription, A.updateSubscription, A.updateSubscriptionStatus, A.deleteSubscription,
    A.bulkActionSubscription,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.loadSubscriptionsFailure, A.loadActiveSubscriptionsFailure, A.loadMySubscriptionsFailure, A.loadSubscriptionFailure,
    A.addSubscriptionFailure, A.updateSubscriptionFailure, A.updateSubscriptionStatusFailure, A.deleteSubscriptionFailure,
    A.bulkActionSubscriptionFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadSubscriptionsSuccess, (s, { data }) => ({
    ...s, loading: false, subscriptions: data ?? []
  })),

  on(A.loadActiveSubscriptionsSuccess, (s, { data }) => ({
    ...s, loading: false, activeSubscriptions: data ?? []
  })),

  on(A.loadMySubscriptionsSuccess, (s, { data }) => ({
    ...s, loading: false, mySubscriptions: data ?? []
  })),

  on(A.loadSubscriptionSuccess, (s, { data }) => ({
    ...s, loading: false, selectedSubscription: data ?? null
  })),

  // Mutations only return a message (no ApiResponse/DTO on this backend yet) —
  // consumers must re-dispatch the relevant load action after seeing the message.
  on(
    A.addSubscriptionSuccess, A.updateSubscriptionSuccess, A.updateSubscriptionStatusSuccess,
    A.deleteSubscriptionSuccess, A.bulkActionSubscriptionSuccess,
    (s, { message }) => ({ ...s, loading: false, lastMessage: message })
  ),
);
