import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PartnerState } from './partner.state';
import { partnerFeatureKey } from './partner.reducer';

const selectState = createFeatureSelector<PartnerState>(partnerFeatureKey);

export const selectPartnerLoading = createSelector(selectState, s => s.loading);
export const selectPartnerError   = createSelector(selectState, s => s.error);

export const selectPartners        = createSelector(selectState, s => s.partners);
export const selectActivePartners  = createSelector(selectState, s => s.activePartners);
export const selectSelectedPartner = createSelector(selectState, s => s.selectedPartner);
export const selectMyPartner       = createSelector(selectState, s => s.myPartner);

export const selectActivePartnerCount = createSelector(
  selectActivePartners,
  list => list.length
);
