import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { TrainerService } from '../../services/trainer.service';
import * as A from './trainer.actions';

@Injectable()
export class TrainerEffects {

  constructor(
    private actions$: Actions,
    private svc: TrainerService,
  ) { }

  // =========================================================================
  // TRAINERS
  // =========================================================================

  loadTrainers$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainers, A.refreshTrainers),
    mergeMap(() => this.svc.getAllTrainers().pipe(
      map(r => A.loadTrainersSuccess({ response: r })),
      catchError(e => of(A.loadTrainersFailure({ error: e?.error?.message || 'Failed to load trainers' })))
    ))
  ));

  loadActiveTrainers$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActiveTrainers, A.refreshTrainers),
    mergeMap(() => this.svc.getActiveTrainers().pipe(
      map(r => A.loadActiveTrainersSuccess({ response: r })),
      catchError(e => of(A.loadActiveTrainersFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMyTrainer$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyTrainer, A.refreshTrainer),
    mergeMap(() => this.svc.getTrainer().pipe(
      map(r => A.loadMyTrainerSuccess({ response: r })),
      catchError(e => of(A.loadMyTrainerFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addTrainer$ = createEffect(() => this.actions$.pipe(
    ofType(A.addTrainer),
    mergeMap(({ data }) => this.svc.addTrainer(data).pipe(
      map(r => A.addTrainerSuccess({ response: r })),
      catchError(e => of(A.addTrainerFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTrainer$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTrainer),
    mergeMap(({ data }) => this.svc.updateTrainer(data).pipe(
      map(r => A.updateTrainerSuccess({ response: r })),
      catchError(e => of(A.updateTrainerFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTrainerPhoto$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTrainerPhoto),
    mergeMap(({ data }) => this.svc.updateTrainerPhoto(data).pipe(
      map(r => A.updateTrainerPhotoSuccess({ response: r })),
      catchError(e => of(A.updateTrainerPhotoFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTrainerStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTrainerStatus),
    mergeMap(({ id }) => this.svc.updateTrainerStatus(id).pipe(
      map(r => A.updateTrainerStatusSuccess({ response: r })),
      catchError(e => of(A.updateTrainerStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  likeTrainer$ = createEffect(() => this.actions$.pipe(
    ofType(A.likeTrainer),
    mergeMap(({ id }) => this.svc.likeTrainer(id).pipe(
      map(r => A.likeTrainerSuccess({ response: r })),
      catchError(e => of(A.likeTrainerFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteTrainer$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteTrainer),
    mergeMap(({ id }) => this.svc.deleteTrainer(id).pipe(
      map(() => A.deleteTrainerSuccess({ id })),
      catchError(e => of(A.deleteTrainerFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadTrainerLikes$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerLikes),
    mergeMap(() => this.svc.getTrainerLikes().pipe(
      map(r => A.loadTrainerLikesSuccess({ response: r })),
      catchError(e => of(A.loadTrainerLikesFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMyTrainerLikes$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyTrainerLikes),
    mergeMap(() => this.svc.getMyTrainerLikes().pipe(
      map(r => A.loadMyTrainerLikesSuccess({ response: r })),
      catchError(e => of(A.loadMyTrainerLikesFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadAllTrainerLikes$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadAllTrainerLikes),
    mergeMap(() => this.svc.getAllTrainerLikes().pipe(
      map(r => A.loadAllTrainerLikesSuccess({ response: r })),
      catchError(e => of(A.loadAllTrainerLikesFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  // =========================================================================
  // TRAINER PRICING
  // =========================================================================

  loadTrainerPricing$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerPricing),
    mergeMap(() => this.svc.getAllTrainerPricing().pipe(
      map(r => A.loadTrainerPricingSuccess({ response: r })),
      catchError(e => of(A.loadTrainerPricingFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMyTrainerPricing$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyTrainerPricing),
    mergeMap(() => this.svc.getMyTrainerPricing().pipe(
      map(r => A.loadMyTrainerPricingSuccess({ response: r })),
      catchError(e => of(A.loadMyTrainerPricingFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addTrainerPricing$ = createEffect(() => this.actions$.pipe(
    ofType(A.addTrainerPricing),
    mergeMap(({ data }) => this.svc.addTrainerPricing(data).pipe(
      map(r => A.addTrainerPricingSuccess({ response: r })),
      catchError(e => of(A.addTrainerPricingFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTrainerPricing$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTrainerPricing),
    mergeMap(({ data }) => this.svc.updateTrainerPricing(data).pipe(
      map(r => A.updateTrainerPricingSuccess({ response: r })),
      catchError(e => of(A.updateTrainerPricingFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteTrainerPricing$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteTrainerPricing),
    mergeMap(({ id }) => this.svc.deleteTrainerPricing(id).pipe(
      map(() => A.deleteTrainerPricingSuccess({ id })),
      catchError(e => of(A.deleteTrainerPricingFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  // =========================================================================
  // TRAINER BENEFITS
  // =========================================================================

  loadTrainerBenefits$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerBenefits),
    mergeMap(() => this.svc.getAllTrainerBenefits().pipe(
      map(r => A.loadTrainerBenefitsSuccess({ response: r })),
      catchError(e => of(A.loadTrainerBenefitsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMyTrainerBenefits$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyTrainerBenefits),
    mergeMap(() => this.svc.getMyTrainerBenefits().pipe(
      map(r => A.loadMyTrainerBenefitsSuccess({ response: r })),
      catchError(e => of(A.loadMyTrainerBenefitsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addTrainerBenefit$ = createEffect(() => this.actions$.pipe(
    ofType(A.addTrainerBenefit),
    mergeMap(({ data }) => this.svc.addTrainerBenefit(data).pipe(
      map(r => A.addTrainerBenefitSuccess({ response: r })),
      catchError(e => of(A.addTrainerBenefitFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTrainerBenefit$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTrainerBenefit),
    mergeMap(({ data }) => this.svc.updateTrainerBenefit(data).pipe(
      map(r => A.updateTrainerBenefitSuccess({ response: r })),
      catchError(e => of(A.updateTrainerBenefitFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteTrainerBenefit$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteTrainerBenefit),
    mergeMap(({ id }) => this.svc.deleteTrainerBenefit(id).pipe(
      map(() => A.deleteTrainerBenefitSuccess({ id })),
      catchError(e => of(A.deleteTrainerBenefitFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  // =========================================================================
  // TRAINER INTRODUCTIONS
  // =========================================================================

  loadTrainerIntroductions$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerIntroductions),
    mergeMap(() => this.svc.getAllTrainerIntroductions().pipe(
      map(r => A.loadTrainerIntroductionsSuccess({ response: r })),
      catchError(e => of(A.loadTrainerIntroductionsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMyTrainerIntroduction$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyTrainerIntroduction),
    mergeMap(() => this.svc.getMyTrainerIntroduction().pipe(
      map(r => A.loadMyTrainerIntroductionSuccess({ response: r })),
      catchError(e => of(A.loadMyTrainerIntroductionFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addTrainerIntroduction$ = createEffect(() => this.actions$.pipe(
    ofType(A.addTrainerIntroduction),
    mergeMap(({ data }) => this.svc.addTrainerIntroduction(data).pipe(
      map(r => A.addTrainerIntroductionSuccess({ response: r })),
      catchError(e => of(A.addTrainerIntroductionFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTrainerIntroduction$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTrainerIntroduction),
    mergeMap(({ data }) => this.svc.updateTrainerIntroduction(data).pipe(
      map(r => A.updateTrainerIntroductionSuccess({ response: r })),
      catchError(e => of(A.updateTrainerIntroductionFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteTrainerIntroduction$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteTrainerIntroduction),
    mergeMap(({ id }) => this.svc.deleteTrainerIntroduction(id).pipe(
      map(() => A.deleteTrainerIntroductionSuccess({ id })),
      catchError(e => of(A.deleteTrainerIntroductionFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  // =========================================================================
  // TRAINER PHOTO ALBUMS
  // =========================================================================

  loadTrainerPhotoAlbums$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerPhotoAlbums),
    mergeMap(() => this.svc.getAllTrainersPhotosAlbum().pipe(
      map(r => A.loadTrainerPhotoAlbumsSuccess({ response: r })),
      catchError(e => of(A.loadTrainerPhotoAlbumsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMyTrainerPhotoAlbum$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyTrainerPhotoAlbum),
    mergeMap(() => this.svc.getMyTrainerPhotosAlbum().pipe(
      map(r => A.loadMyTrainerPhotoAlbumSuccess({ response: r })),
      catchError(e => of(A.loadMyTrainerPhotoAlbumFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadTrainerPhotosInAlbum$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerPhotosInAlbum),
    mergeMap(({ albumId }) => this.svc.getTrainerPhotosInAlbum(albumId).pipe(
      map(r => A.loadTrainerPhotosInAlbumSuccess({ response: r })),
      catchError(e => of(A.loadTrainerPhotosInAlbumFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addTrainerPhotoAlbum$ = createEffect(() => this.actions$.pipe(
    ofType(A.addTrainerPhotoAlbum),
    mergeMap(({ data }) => this.svc.addTrainerPhotosAlbum(data).pipe(
      map(r => A.addTrainerPhotoAlbumSuccess({ response: r })),
      catchError(e => of(A.addTrainerPhotoAlbumFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTrainerPhotoAlbum$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTrainerPhotoAlbum),
    mergeMap(({ data }) => this.svc.updateTrainerPhotosAlbum(data).pipe(
      map(r => A.updateTrainerPhotoAlbumSuccess({ response: r })),
      catchError(e => of(A.updateTrainerPhotoAlbumFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteTrainerPhotoAlbum$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteTrainerPhotoAlbum),
    mergeMap(({ id }) => this.svc.deleteTrainerPhotosAlbum(id).pipe(
      map(() => A.deleteTrainerPhotoAlbumSuccess({ id })),
      catchError(e => of(A.deleteTrainerPhotoAlbumFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  // =========================================================================
  // TRAINER VIDEO ALBUMS
  // =========================================================================

  loadTrainerVideoAlbums$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerVideoAlbums),
    mergeMap(() => this.svc.getAllTrainersVideosAlbum().pipe(
      map(r => A.loadTrainerVideoAlbumsSuccess({ response: r })),
      catchError(e => of(A.loadTrainerVideoAlbumsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMyTrainerVideoAlbum$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyTrainerVideoAlbum),
    mergeMap(() => this.svc.getMyTrainerVideosAlbum().pipe(
      map(r => A.loadMyTrainerVideoAlbumSuccess({ response: r })),
      catchError(e => of(A.loadMyTrainerVideoAlbumFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addTrainerVideoAlbum$ = createEffect(() => this.actions$.pipe(
    ofType(A.addTrainerVideoAlbum),
    mergeMap(({ data }) => this.svc.addTrainerVideosAlbum(data).pipe(
      map(r => A.addTrainerVideoAlbumSuccess({ response: r })),
      catchError(e => of(A.addTrainerVideoAlbumFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTrainerVideoAlbum$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTrainerVideoAlbum),
    mergeMap(({ data }) => this.svc.updateTrainerVideosAlbum(data).pipe(
      map(r => A.updateTrainerVideoAlbumSuccess({ response: r })),
      catchError(e => of(A.updateTrainerVideoAlbumFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteTrainerVideoAlbum$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteTrainerVideoAlbum),
    mergeMap(({ id }) => this.svc.deleteTrainerVideosAlbum(id).pipe(
      map(() => A.deleteTrainerVideoAlbumSuccess({ id })),
      catchError(e => of(A.deleteTrainerVideoAlbumFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  // =========================================================================
  // TRAINER FEATURE VIDEOS
  // =========================================================================

  loadTrainerFeatureVideos$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerFeatureVideos),
    mergeMap(() => this.svc.getAllTrainerFeatureVideos().pipe(
      map(r => A.loadTrainerFeatureVideosSuccess({ response: r })),
      catchError(e => of(A.loadTrainerFeatureVideosFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMyTrainerFeatureVideos$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyTrainerFeatureVideos),
    mergeMap(() => this.svc.getMyTrainerFeatureVideos().pipe(
      map(r => A.loadMyTrainerFeatureVideosSuccess({ response: r })),
      catchError(e => of(A.loadMyTrainerFeatureVideosFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadActiveTrainerFeatureVideos$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActiveTrainerFeatureVideos),
    mergeMap(({ trainerId }) => this.svc.getActiveFeatureVideos(trainerId).pipe(
      map(r => A.loadActiveTrainerFeatureVideosSuccess({ response: r })),
      catchError(e => of(A.loadActiveTrainerFeatureVideosFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addTrainerFeatureVideo$ = createEffect(() => this.actions$.pipe(
    ofType(A.addTrainerFeatureVideo),
    mergeMap(({ data }) => this.svc.addTrainerFeatureVideo(data).pipe(
      map(r => A.addTrainerFeatureVideoSuccess({ response: r })),
      catchError(e => of(A.addTrainerFeatureVideoFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTrainerFeatureVideo$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTrainerFeatureVideo),
    mergeMap(({ data }) => this.svc.updateTrainerFeatureVideo(data).pipe(
      map(r => A.updateTrainerFeatureVideoSuccess({ response: r })),
      catchError(e => of(A.updateTrainerFeatureVideoFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteTrainerFeatureVideo$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteTrainerFeatureVideo),
    mergeMap(({ id }) => this.svc.deleteTrainerFeatureVideo(id).pipe(
      map(() => A.deleteTrainerFeatureVideoSuccess({ id })),
      catchError(e => of(A.deleteTrainerFeatureVideoFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  setTrainerFeaturedVideo$ = createEffect(() => this.actions$.pipe(
    ofType(A.setTrainerFeaturedVideo),
    mergeMap(({ id }) => this.svc.setFeaturedVideo(id).pipe(
      map(r => A.setTrainerFeaturedVideoSuccess({ response: r })),
      catchError(e => of(A.setTrainerFeaturedVideoFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTrainerFeatureVideoPosition$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTrainerFeatureVideoPosition),
    mergeMap(({ id, position }) => this.svc.updateFeatureVideoPosition(id, position).pipe(
      map(r => A.updateTrainerFeatureVideoPositionSuccess({ response: r })),
      catchError(e => of(A.updateTrainerFeatureVideoPositionFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  incrementTrainerFeatureVideoViews$ = createEffect(() => this.actions$.pipe(
    ofType(A.incrementTrainerFeatureVideoViews),
    mergeMap(({ id }) => this.svc.incrementFeatureVideoViews(id).pipe(
      map(r => A.incrementTrainerFeatureVideoViewsSuccess({ response: r })),
      catchError(e => of(A.incrementTrainerFeatureVideoViewsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  // =========================================================================
  // TRAINER CLIENTS
  // =========================================================================

  loadTrainerClients$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerClients),
    mergeMap(() => this.svc.getMyTrainerClients().pipe(
      map(r => A.loadTrainerClientsSuccess({ response: r })),
      catchError(e => of(A.loadTrainerClientsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadTrainerActiveClients$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerActiveClients),
    mergeMap(() => this.svc.getMyTrainerActiveClients().pipe(
      map(r => A.loadTrainerActiveClientsSuccess({ response: r })),
      catchError(e => of(A.loadTrainerActiveClientsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadTrainerCenterTrainers$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerCenterTrainers),
    mergeMap(() => this.svc.getMyCenterTrainers().pipe(
      map(r => A.loadTrainerCenterTrainersSuccess({ response: r })),
      catchError(e => of(A.loadTrainerCenterTrainersFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  // =========================================================================
  // TRAINER SUBSCRIPTIONS
  // =========================================================================

  loadTrainerSubscriptions$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerSubscriptions),
    mergeMap(() => this.svc.getAllTrainersSubscriptions().pipe(
      map(r => A.loadTrainerSubscriptionsSuccess({ response: r })),
      catchError(e => of(A.loadTrainerSubscriptionsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadActiveTrainerSubscriptions$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActiveTrainerSubscriptions),
    mergeMap(() => this.svc.getActiveTrainersSubscriptions().pipe(
      map(r => A.loadActiveTrainerSubscriptionsSuccess({ response: r })),
      catchError(e => of(A.loadActiveTrainerSubscriptionsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMyTrainerSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyTrainerSubscription),
    mergeMap(() => this.svc.getMyTrainerSubscription().pipe(
      map(r => A.loadMyTrainerSubscriptionSuccess({ response: r })),
      catchError(e => of(A.loadMyTrainerSubscriptionFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addTrainerSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(A.addTrainerSubscription),
    mergeMap(({ data }) => this.svc.addTrainerSubscription(data).pipe(
      map(r => A.addTrainerSubscriptionSuccess({ response: r })),
      catchError(e => of(A.addTrainerSubscriptionFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTrainerSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTrainerSubscription),
    mergeMap(({ data }) => this.svc.updateTrainerSubscription(data).pipe(
      map(r => A.updateTrainerSubscriptionSuccess({ response: r })),
      catchError(e => of(A.updateTrainerSubscriptionFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTrainerSubscriptionStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTrainerSubscriptionStatus),
    mergeMap(({ status, activationCode }) => this.svc.updateTrainerSubscriptionStatus(status, activationCode).pipe(
      map(r => A.updateTrainerSubscriptionStatusSuccess({ response: r })),
      catchError(e => of(A.updateTrainerSubscriptionStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteTrainerSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteTrainerSubscription),
    mergeMap(({ id }) => this.svc.deleteTrainerSubscription(id).pipe(
      map(() => A.deleteTrainerSubscriptionSuccess({ id })),
      catchError(e => of(A.deleteTrainerSubscriptionFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  // =========================================================================
  // TRAINER REVIEWS
  // =========================================================================

  loadTrainerReviews$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerReviews),
    mergeMap(() => this.svc.getAllTrainerReviews().pipe(
      map(r => A.loadTrainerReviewsSuccess({ response: r })),
      catchError(e => of(A.loadTrainerReviewsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadActiveTrainerReviews$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActiveTrainerReviews),
    mergeMap(({ id }) => this.svc.getActiveTrainerReviews(id).pipe(
      map(r => A.loadActiveTrainerReviewsSuccess({ response: r })),
      catchError(e => of(A.loadActiveTrainerReviewsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMyTrainerReviews$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyTrainerReviews),
    mergeMap(() => this.svc.getMyTrainerReviews().pipe(
      map(r => A.loadMyTrainerReviewsSuccess({ response: r })),
      catchError(e => of(A.loadMyTrainerReviewsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadTrainerReviewLikes$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerReviewLikes),
    mergeMap(() => this.svc.getTrainerReviewLikes().pipe(
      map(r => A.loadTrainerReviewLikesSuccess({ response: r })),
      catchError(e => of(A.loadTrainerReviewLikesFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addTrainerReview$ = createEffect(() => this.actions$.pipe(
    ofType(A.addTrainerReview),
    mergeMap(({ data }) => this.svc.addTrainerReview(data).pipe(
      map(r => A.addTrainerReviewSuccess({ response: r })),
      catchError(e => of(A.addTrainerReviewFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTrainerReview$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTrainerReview),
    mergeMap(({ data }) => this.svc.updateTrainerReview(data).pipe(
      map(r => A.updateTrainerReviewSuccess({ response: r })),
      catchError(e => of(A.updateTrainerReviewFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  updateTrainerReviewStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTrainerReviewStatus),
    mergeMap(({ id }) => this.svc.updateTrainerReviewStatus(id).pipe(
      map(r => A.updateTrainerReviewStatusSuccess({ response: r })),
      catchError(e => of(A.updateTrainerReviewStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  disableTrainerReview$ = createEffect(() => this.actions$.pipe(
    ofType(A.disableTrainerReview),
    mergeMap(({ id }) => this.svc.disableTrainerReview(id).pipe(
      map(r => A.disableTrainerReviewSuccess({ response: r })),
      catchError(e => of(A.disableTrainerReviewFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  likeTrainerReview$ = createEffect(() => this.actions$.pipe(
    ofType(A.likeTrainerReview),
    mergeMap(({ id }) => this.svc.likeTrainerReview(id).pipe(
      map(r => A.likeTrainerReviewSuccess({ response: r })),
      catchError(e => of(A.likeTrainerReviewFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteTrainerReview$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteTrainerReview),
    mergeMap(({ id }) => this.svc.deleteTrainerReview(id).pipe(
      map(() => A.deleteTrainerReviewSuccess({ id })),
      catchError(e => of(A.deleteTrainerReviewFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  // =========================================================================
  // TRAINER TESTIMONIALS
  // =========================================================================

  loadTrainerTestimonials$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTrainerTestimonials),
    mergeMap(() => this.svc.getAllTrainerTestimonials().pipe(
      map(r => A.loadTrainerTestimonialsSuccess({ response: r })),
      catchError(e => of(A.loadTrainerTestimonialsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMyTrainerTestimonials$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyTrainerTestimonials),
    mergeMap(() => this.svc.getMyTrainerTestimonials().pipe(
      map(r => A.loadMyTrainerTestimonialsSuccess({ response: r })),
      catchError(e => of(A.loadMyTrainerTestimonialsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));
}