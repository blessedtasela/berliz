import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { Testimonials } from '../../models/testimonials.model';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };
type Id = { id: number };
type Data = { data: any };
type TrainerId = { trainerId: number };
type CenterId = { centerId: number };

export const loadTestimonials = createAction('[Testimonial] Load All');
export const loadTestimonialsSuccess = createAction('[Testimonial] Load All Success', props<Res<Testimonials[]>>());
export const loadTestimonialsFailure = createAction('[Testimonial] Load All Failure', props<Err>());

export const loadActiveTestimonials = createAction('[Testimonial] Load Active');
export const loadActiveTestimonialsSuccess = createAction('[Testimonial] Load Active Success', props<Res<Testimonials[]>>());
export const loadActiveTestimonialsFailure = createAction('[Testimonial] Load Active Failure', props<Err>());

export const loadTestimonialsByTrainer = createAction('[Testimonial] Load By Trainer', props<TrainerId>());
export const loadTestimonialsByTrainerSuccess = createAction('[Testimonial] Load By Trainer Success', props<Res<Testimonials[]>>());
export const loadTestimonialsByTrainerFailure = createAction('[Testimonial] Load By Trainer Failure', props<Err>());

export const loadTestimonialsByCenter = createAction('[Testimonial] Load By Center', props<CenterId>());
export const loadTestimonialsByCenterSuccess = createAction('[Testimonial] Load By Center Success', props<Res<Testimonials[]>>());
export const loadTestimonialsByCenterFailure = createAction('[Testimonial] Load By Center Failure', props<Err>());

export const loadTestimonial = createAction('[Testimonial] Load By Id', props<Id>());
export const loadTestimonialSuccess = createAction('[Testimonial] Load By Id Success', props<Res<Testimonials>>());
export const loadTestimonialFailure = createAction('[Testimonial] Load By Id Failure', props<Err>());

export const addTestimonial = createAction('[Testimonial] Add', props<Data>());
export const addTestimonialSuccess = createAction('[Testimonial] Add Success', props<Res<Testimonials>>());
export const addTestimonialFailure = createAction('[Testimonial] Add Failure', props<Err>());

export const updateTestimonial = createAction('[Testimonial] Update', props<Data>());
export const updateTestimonialSuccess = createAction('[Testimonial] Update Success', props<Res<Testimonials>>());
export const updateTestimonialFailure = createAction('[Testimonial] Update Failure', props<Err>());

export const updateTestimonialStatus = createAction('[Testimonial] Update Status', props<Id>());
export const updateTestimonialStatusSuccess = createAction('[Testimonial] Update Status Success', props<Res<Testimonials>>());
export const updateTestimonialStatusFailure = createAction('[Testimonial] Update Status Failure', props<Err>());

export const updateTestimonialFeatured = createAction('[Testimonial] Update Featured', props<Id>());
export const updateTestimonialFeaturedSuccess = createAction('[Testimonial] Update Featured Success', props<Res<Testimonials>>());
export const updateTestimonialFeaturedFailure = createAction('[Testimonial] Update Featured Failure', props<Err>());

export const deleteTestimonial = createAction('[Testimonial] Delete', props<Id>());
export const deleteTestimonialSuccess = createAction('[Testimonial] Delete Success', props<Id>());
export const deleteTestimonialFailure = createAction('[Testimonial] Delete Failure', props<Err>());
