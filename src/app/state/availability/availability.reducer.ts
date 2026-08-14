import { createReducer, on } from '@ngrx/store';
import * as A from './availability.actions';
import { initialAvailabilityState } from './availability.state';

export const availabilityFeatureKey = 'availability';

export const availabilityReducer = createReducer(
  initialAvailabilityState,

  on(
    A.setMyAvailability, A.loadMyAvailability, A.loadProviderAvailability, A.loadAvailableSlots,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.setMyAvailabilityFailure, A.loadMyAvailabilityFailure,
    A.loadProviderAvailabilityFailure, A.loadAvailableSlotsFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.setMyAvailabilitySuccess, A.loadMyAvailabilitySuccess, (s, { response }) => ({
    ...s, loading: false, myAvailability: response.data ?? []
  })),

  on(A.loadProviderAvailabilitySuccess, (s, { response }) => ({
    ...s, loading: false, providerAvailability: response.data ?? []
  })),

  on(A.loadAvailableSlotsSuccess, (s, { response }) => ({
    ...s, loading: false, availableSlots: response.data ?? null
  })),

  on(A.clearAvailableSlots, s => ({ ...s, availableSlots: null })),
);
