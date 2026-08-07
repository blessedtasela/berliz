import { createReducer, on } from '@ngrx/store';
import * as A from './testimonial.actions';
import { initialTestimonialState } from './testimonial.state';

export const testimonialFeatureKey = 'testimonial';

function upsert<T extends { id?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [...list, item];
}

/**
 * Like `upsert`, but never appends. Used for the trainer/center-scoped lists,
 * where an item that is not already in the list does not belong in it.
 */
function replaceIfPresent<T extends { id?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : list;
}

export const testimonialReducer = createReducer(
  initialTestimonialState,

  on(
    A.loadTestimonials, A.loadActiveTestimonials, A.loadTestimonial,
    A.loadTestimonialsByTrainer, A.loadTestimonialsByCenter,
    A.addTestimonial, A.updateTestimonial, A.updateTestimonialStatus,
    A.updateTestimonialFeatured, A.deleteTestimonial,
    state => ({ ...state, loading: true, error: null })
  ),

  on(
    A.loadTestimonialsFailure, A.loadActiveTestimonialsFailure, A.loadTestimonialFailure,
    A.loadTestimonialsByTrainerFailure, A.loadTestimonialsByCenterFailure,
    A.addTestimonialFailure, A.updateTestimonialFailure, A.updateTestimonialStatusFailure,
    A.updateTestimonialFeaturedFailure, A.deleteTestimonialFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  on(A.loadTestimonialsSuccess, (s, { response }) => ({
    ...s, loading: false, testimonials: response.data ?? []
  })),

  on(A.loadActiveTestimonialsSuccess, (s, { response }) => ({
    ...s, loading: false, activeTestimonials: response.data ?? []
  })),

  on(A.loadTestimonialsByTrainerSuccess, (s, { response }) => ({
    ...s, loading: false, testimonialsByTrainer: response.data ?? []
  })),

  on(A.loadTestimonialsByCenterSuccess, (s, { response }) => ({
    ...s, loading: false, testimonialsByCenter: response.data ?? []
  })),

  on(A.loadTestimonialSuccess, (s, { response }) => ({
    ...s, loading: false, selectedTestimonial: response.data ?? null
  })),

  on(A.addTestimonialSuccess, (s, { response }) => ({
    ...s, loading: false,
    testimonials: response.data ? [...s.testimonials, response.data] : s.testimonials,
  })),

  on(A.updateTestimonialSuccess, A.updateTestimonialStatusSuccess, (s, { response }) => ({
    ...s, loading: false,
    selectedTestimonial: response.data ?? s.selectedTestimonial,
    testimonials: response.data ? upsert(s.testimonials, response.data) : s.testimonials,
    activeTestimonials: response.data ? upsert(s.activeTestimonials, response.data) : s.activeTestimonials,
  })),

  on(A.updateTestimonialFeaturedSuccess, (s, { response }) => ({
    ...s, loading: false,
    selectedTestimonial: response.data ?? s.selectedTestimonial,
    testimonials: response.data ? upsert(s.testimonials, response.data) : s.testimonials,
    activeTestimonials: response.data ? upsert(s.activeTestimonials, response.data) : s.activeTestimonials,
    testimonialsByTrainer: response.data ? replaceIfPresent(s.testimonialsByTrainer, response.data) : s.testimonialsByTrainer,
    testimonialsByCenter: response.data ? replaceIfPresent(s.testimonialsByCenter, response.data) : s.testimonialsByCenter,
  })),

  on(A.deleteTestimonialSuccess, (s, { id }) => ({
    ...s, loading: false,
    selectedTestimonial: s.selectedTestimonial?.id === id ? null : s.selectedTestimonial,
    testimonials: s.testimonials.filter(t => t.id !== id),
    activeTestimonials: s.activeTestimonials.filter(t => t.id !== id),
    testimonialsByTrainer: s.testimonialsByTrainer.filter(t => t.id !== id),
    testimonialsByCenter: s.testimonialsByCenter.filter(t => t.id !== id),
  })),
);
