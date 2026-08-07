import { createReducer, on } from '@ngrx/store';
import * as A from './faq.actions';
import { initialFaqState } from './faq.state';

export const faqFeatureKey = 'faq';

function upsert<T extends { id?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [...list, item];
}

export const faqReducer = createReducer(
  initialFaqState,

  on(
    A.loadFaqs, A.loadActiveFaqs, A.addFaq, A.updateFaq, A.updateFaqStatus, A.deleteFaq,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.loadFaqsFailure, A.loadActiveFaqsFailure,
    A.addFaqFailure, A.updateFaqFailure, A.updateFaqStatusFailure, A.deleteFaqFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadFaqsSuccess, (s, { response }) => ({
    ...s, loading: false, faqs: response.data ?? []
  })),

  on(A.loadActiveFaqsSuccess, (s, { response }) => ({
    ...s, loading: false, activeFaqs: response.data ?? []
  })),

  on(A.addFaqSuccess, (s, { response }) => ({
    ...s, loading: false,
    faqs: response.data ? [...s.faqs, response.data] : s.faqs,
    activeFaqs: response.data && response.data.status === 'true'
      ? [...s.activeFaqs, response.data]
      : s.activeFaqs,
  })),

  on(A.updateFaqSuccess, A.updateFaqStatusSuccess, (s, { response }) => ({
    ...s, loading: false,
    faqs: response.data ? upsert(s.faqs, response.data) : s.faqs,
    activeFaqs: response.data
      ? (response.data.status === 'true'
          ? upsert(s.activeFaqs, response.data)
          : s.activeFaqs.filter(f => f.id !== response.data.id))
      : s.activeFaqs,
  })),

  on(A.deleteFaqSuccess, (s, { id }) => ({
    ...s, loading: false,
    faqs: s.faqs.filter(f => f.id !== id),
    activeFaqs: s.activeFaqs.filter(f => f.id !== id),
  })),
);
