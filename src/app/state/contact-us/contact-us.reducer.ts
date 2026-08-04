import { createReducer, on } from '@ngrx/store';
import * as A from './contact-us.actions';
import { initialContactUsState } from './contact-us.state';

export const contactUsFeatureKey = 'contactUs';

export const contactUsReducer = createReducer(
  initialContactUsState,

  on(
    A.loadContactUs, A.loadContactUsMessages,
    A.addContactUs, A.updateContactUs, A.updateContactUsStatus, A.reviewContactUs, A.deleteContactUs,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.loadContactUsFailure, A.loadContactUsMessagesFailure,
    A.addContactUsFailure, A.updateContactUsFailure, A.updateContactUsStatusFailure, A.reviewContactUsFailure, A.deleteContactUsFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadContactUsSuccess, (s, { data }) => ({
    ...s, loading: false, contactUs: data ?? []
  })),

  on(A.loadContactUsMessagesSuccess, (s, { data }) => ({
    ...s, loading: false, contactUsMessages: data ?? []
  })),

  // Mutations only return a message (no ApiResponse/DTO on this backend) —
  // consumers must re-dispatch loadContactUs/loadContactUsMessages to refresh.
  on(
    A.addContactUsSuccess, A.updateContactUsSuccess, A.updateContactUsStatusSuccess, A.reviewContactUsSuccess, A.deleteContactUsSuccess,
    (s, { message }) => ({ ...s, loading: false, lastMessage: message })
  ),
);
