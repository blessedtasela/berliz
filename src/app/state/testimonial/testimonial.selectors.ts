import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TestimonialState } from './testimonial.state';
import { testimonialFeatureKey } from './testimonial.reducer';

const selectState = createFeatureSelector<TestimonialState>(testimonialFeatureKey);

export const selectTestimonialLoading = createSelector(selectState, s => s.loading);
export const selectTestimonialError   = createSelector(selectState, s => s.error);

export const selectTestimonials        = createSelector(selectState, s => s.testimonials);
export const selectActiveTestimonials  = createSelector(selectState, s => s.activeTestimonials);
export const selectSelectedTestimonial = createSelector(selectState, s => s.selectedTestimonial);

export const selectTestimonialsByTrainer = createSelector(selectState, s => s.testimonialsByTrainer);
export const selectTestimonialsByCenter  = createSelector(selectState, s => s.testimonialsByCenter);
