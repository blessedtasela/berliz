import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FaqState } from './faq.state';
import { faqFeatureKey } from './faq.reducer';

const selectState = createFeatureSelector<FaqState>(faqFeatureKey);

export const selectFaqLoading = createSelector(selectState, s => s.loading);
export const selectFaqError = createSelector(selectState, s => s.error);

export const selectFaqs = createSelector(selectState, s => s.faqs);
export const selectActiveFaqs = createSelector(selectState, s => s.activeFaqs);
