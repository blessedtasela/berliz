import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NewsletterState } from './newsletter.state';
import { newsletterFeatureKey } from './newsletter.reducer';

const selectState = createFeatureSelector<NewsletterState>(newsletterFeatureKey);

export const selectNewsletterLoading = createSelector(selectState, s => s.loading);
export const selectNewsletterError   = createSelector(selectState, s => s.error);
export const selectNewsletterMessage = createSelector(selectState, s => s.lastMessage);

export const selectNewsletters        = createSelector(selectState, s => s.newsletters);
export const selectActiveNewsletters  = createSelector(selectState, s => s.activeNewsletters);
export const selectNewsletterMessages = createSelector(selectState, s => s.newsletterMessages);
