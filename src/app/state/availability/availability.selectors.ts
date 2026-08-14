import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AvailabilityState } from './availability.state';
import { availabilityFeatureKey } from './availability.reducer';

const selectState = createFeatureSelector<AvailabilityState>(availabilityFeatureKey);

export const selectAvailabilityLoading = createSelector(selectState, s => s.loading);
export const selectAvailabilityError = createSelector(selectState, s => s.error);

export const selectMyAvailability = createSelector(selectState, s => s.myAvailability);
export const selectProviderAvailability = createSelector(selectState, s => s.providerAvailability);
export const selectAvailableSlots = createSelector(selectState, s => s.availableSlots);
