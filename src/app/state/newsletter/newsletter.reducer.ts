import { createReducer, on } from '@ngrx/store';
import * as A from './newsletter.actions';
import { initialNewsletterState } from './newsletter.state';

export const newsletterFeatureKey = 'newsletter';

export const newsletterReducer = createReducer(
  initialNewsletterState,

  on(
    A.loadNewsletters, A.loadActiveNewsletters, A.loadNewsletterMessages,
    A.addNewsletter, A.updateNewsletter, A.updateNewsletterStatus, A.deleteNewsletter,
    A.sendNewsletterMessage, A.sendNewsletterBulkMessage,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.loadNewslettersFailure, A.loadActiveNewslettersFailure, A.loadNewsletterMessagesFailure,
    A.addNewsletterFailure, A.updateNewsletterFailure, A.updateNewsletterStatusFailure, A.deleteNewsletterFailure,
    A.sendNewsletterMessageFailure, A.sendNewsletterBulkMessageFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadNewslettersSuccess, (s, { data }) => ({
    ...s, loading: false, newsletters: data ?? []
  })),

  on(A.loadActiveNewslettersSuccess, (s, { data }) => ({
    ...s, loading: false, activeNewsletters: data ?? []
  })),

  on(A.loadNewsletterMessagesSuccess, (s, { data }) => ({
    ...s, loading: false, newsletterMessages: data ?? []
  })),

  // Mutations only return a message (no ApiResponse/DTO on this backend) —
  // consumers must re-dispatch loadNewsletters/loadNewsletterMessages to refresh.
  on(
    A.addNewsletterSuccess, A.updateNewsletterSuccess, A.updateNewsletterStatusSuccess, A.deleteNewsletterSuccess,
    A.sendNewsletterMessageSuccess, A.sendNewsletterBulkMessageSuccess,
    (s, { message }) => ({ ...s, loading: false, lastMessage: message })
  ),
);
