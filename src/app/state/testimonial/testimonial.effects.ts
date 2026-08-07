import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { TestimonialService } from '../../services/testimonial.service';
import * as A from './testimonial.actions';

@Injectable()
export class TestimonialEffects {

  constructor(
    private actions$: Actions,
    private svc: TestimonialService,
  ) { }

  loadTestimonials$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTestimonials),
    mergeMap(() => this.svc.getAllTestimonials().pipe(
      map(response => A.loadTestimonialsSuccess({ response })),
      catchError(e => of(A.loadTestimonialsFailure({ error: e?.error?.message || 'Failed to load testimonials' })))
    ))
  ));

  loadActiveTestimonials$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActiveTestimonials),
    mergeMap(() => this.svc.getActiveTestimonials().pipe(
      map(response => A.loadActiveTestimonialsSuccess({ response })),
      catchError(e => of(A.loadActiveTestimonialsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadTestimonialsByTrainer$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTestimonialsByTrainer),
    mergeMap(({ trainerId }) => this.svc.getByTrainer(trainerId).pipe(
      map(response => A.loadTestimonialsByTrainerSuccess({ response })),
      catchError(e => of(A.loadTestimonialsByTrainerFailure({ error: e?.error?.message || 'Failed to load testimonials' })))
    ))
  ));

  loadTestimonialsByCenter$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTestimonialsByCenter),
    mergeMap(({ centerId }) => this.svc.getByCenter(centerId).pipe(
      map(response => A.loadTestimonialsByCenterSuccess({ response })),
      catchError(e => of(A.loadTestimonialsByCenterFailure({ error: e?.error?.message || 'Failed to load testimonials' })))
    ))
  ));

  loadTestimonial$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTestimonial),
    mergeMap(({ id }) => this.svc.getTestimonial(id).pipe(
      map(response => A.loadTestimonialSuccess({ response })),
      catchError(e => of(A.loadTestimonialFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addTestimonial$ = createEffect(() => this.actions$.pipe(
    ofType(A.addTestimonial),
    mergeMap(({ data }) => this.svc.addTestimonial(data).pipe(
      map(response => A.addTestimonialSuccess({ response })),
      catchError(e => of(A.addTestimonialFailure({ error: e?.error?.message || 'Failed to add testimonial' })))
    ))
  ));

  updateTestimonial$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTestimonial),
    mergeMap(({ data }) => this.svc.updateTestimonial(data).pipe(
      map(response => A.updateTestimonialSuccess({ response })),
      catchError(e => of(A.updateTestimonialFailure({ error: e?.error?.message || 'Failed to update testimonial' })))
    ))
  ));

  updateTestimonialStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTestimonialStatus),
    mergeMap(({ id }) => this.svc.updateStatus(id).pipe(
      map(response => A.updateTestimonialStatusSuccess({ response })),
      catchError(e => of(A.updateTestimonialStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTestimonialFeatured$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTestimonialFeatured),
    mergeMap(({ id }) => this.svc.updateFeatured(id).pipe(
      map(response => A.updateTestimonialFeaturedSuccess({ response })),
      catchError(e => of(A.updateTestimonialFeaturedFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteTestimonial$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteTestimonial),
    mergeMap(({ id }) => this.svc.deleteTestimonial(id).pipe(
      map(() => A.deleteTestimonialSuccess({ id })),
      catchError(e => of(A.deleteTestimonialFailure({ error: e?.error?.message || 'Failed to delete testimonial' })))
    ))
  ));
}
