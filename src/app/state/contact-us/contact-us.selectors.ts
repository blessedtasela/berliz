import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ContactUsState } from './contact-us.state';
import { contactUsFeatureKey } from './contact-us.reducer';

const selectState = createFeatureSelector<ContactUsState>(contactUsFeatureKey);

export const selectContactUsLoading = createSelector(selectState, s => s.loading);
export const selectContactUsError   = createSelector(selectState, s => s.error);
export const selectContactUsMessage = createSelector(selectState, s => s.lastMessage);

export const selectContactUsList     = createSelector(selectState, s => s.contactUs);
export const selectContactUsMessages = createSelector(selectState, s => s.contactUsMessages);
