import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClientIntakeState } from './client-intake.state';
import { clientIntakeFeatureKey } from './client-intake.reducer';

const selectState = createFeatureSelector<ClientIntakeState>(clientIntakeFeatureKey);

export const selectClientIntakeLoading = createSelector(selectState, s => s.loading);
export const selectClientIntakeError = createSelector(selectState, s => s.error);

export const selectMyClientIntakes = createSelector(selectState, s => s.myIntakes);
export const selectSelectedClientIntake = createSelector(selectState, s => s.selectedIntake);
