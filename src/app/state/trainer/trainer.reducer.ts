import { createReducer, on } from '@ngrx/store';
import * as A from './trainer.actions';
import { initialTrainerState } from './trainer.state';

export const trainerFeatureKey = 'trainer';

function upsert<T extends { id?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [...list, item];
}

export const trainerReducer = createReducer(
  initialTrainerState,

  // ── LOADING ───────────────────────────────────────────────────────────────
  on(
    A.loadTrainers, A.loadActiveTrainers, A.loadMyTrainer,
    A.addTrainer, A.updateTrainer, A.updateTrainerPhoto,
    A.updateTrainerStatus, A.deleteTrainer, A.likeTrainer,
    A.loadTrainerLikes, A.loadMyTrainerLikes, A.loadAllTrainerLikes,
    A.loadTrainerPricing, A.loadMyTrainerPricing,
    A.addTrainerPricing, A.updateTrainerPricing, A.deleteTrainerPricing,
    A.loadTrainerBenefits, A.loadMyTrainerBenefits,
    A.addTrainerBenefit, A.updateTrainerBenefit, A.deleteTrainerBenefit,
    A.loadTrainerIntroductions, A.loadMyTrainerIntroduction,
    A.addTrainerIntroduction, A.updateTrainerIntroduction, A.deleteTrainerIntroduction,
    A.loadTrainerPhotoAlbums, A.loadMyTrainerPhotoAlbum, A.loadTrainerPhotosInAlbum,
    A.addTrainerPhotoAlbum, A.updateTrainerPhotoAlbum, A.deleteTrainerPhotoAlbum,
    A.loadTrainerVideoAlbums, A.loadMyTrainerVideoAlbum,
    A.addTrainerVideoAlbum, A.updateTrainerVideoAlbum, A.deleteTrainerVideoAlbum,
    A.loadTrainerFeatureVideos, A.loadMyTrainerFeatureVideos, A.loadActiveTrainerFeatureVideos,
    A.addTrainerFeatureVideo, A.updateTrainerFeatureVideo, A.deleteTrainerFeatureVideo,
    A.setTrainerFeaturedVideo, A.updateTrainerFeatureVideoPosition, A.incrementTrainerFeatureVideoViews,
    A.loadTrainerClients, A.loadTrainerActiveClients, A.loadTrainerCenterTrainers,
    A.loadTrainerSubscriptions, A.loadActiveTrainerSubscriptions, A.loadMyTrainerSubscription,
    A.addTrainerSubscription, A.updateTrainerSubscription,
    A.updateTrainerSubscriptionStatus, A.deleteTrainerSubscription,
    A.loadTrainerReviews, A.loadActiveTrainerReviews, A.loadMyTrainerReviews,
    A.loadTrainerReviewLikes, A.addTrainerReview, A.updateTrainerReview,
    A.updateTrainerReviewStatus, A.disableTrainerReview, A.likeTrainerReview, A.deleteTrainerReview,
    A.loadTrainerTestimonials, A.loadMyTrainerTestimonials,
    state => ({ ...state, loading: true, error: null })
  ),

  // ── ALL FAILURES ──────────────────────────────────────────────────────────
  on(
    A.loadTrainersFailure, A.loadActiveTrainersFailure, A.loadMyTrainerFailure,
    A.addTrainerFailure, A.updateTrainerFailure, A.updateTrainerPhotoFailure,
    A.updateTrainerStatusFailure, A.deleteTrainerFailure, A.likeTrainerFailure,
    A.loadTrainerLikesFailure, A.loadMyTrainerLikesFailure, A.loadAllTrainerLikesFailure,
    A.loadTrainerPricingFailure, A.loadMyTrainerPricingFailure,
    A.addTrainerPricingFailure, A.updateTrainerPricingFailure, A.deleteTrainerPricingFailure,
    A.loadTrainerBenefitsFailure, A.loadMyTrainerBenefitsFailure,
    A.addTrainerBenefitFailure, A.updateTrainerBenefitFailure, A.deleteTrainerBenefitFailure,
    A.loadTrainerIntroductionsFailure, A.loadMyTrainerIntroductionFailure,
    A.addTrainerIntroductionFailure, A.updateTrainerIntroductionFailure, A.deleteTrainerIntroductionFailure,
    A.loadTrainerPhotoAlbumsFailure, A.loadMyTrainerPhotoAlbumFailure, A.loadTrainerPhotosInAlbumFailure,
    A.addTrainerPhotoAlbumFailure, A.updateTrainerPhotoAlbumFailure, A.deleteTrainerPhotoAlbumFailure,
    A.loadTrainerVideoAlbumsFailure, A.loadMyTrainerVideoAlbumFailure,
    A.addTrainerVideoAlbumFailure, A.updateTrainerVideoAlbumFailure, A.deleteTrainerVideoAlbumFailure,
    A.loadTrainerFeatureVideosFailure, A.loadMyTrainerFeatureVideosFailure, A.loadActiveTrainerFeatureVideosFailure,
    A.addTrainerFeatureVideoFailure, A.updateTrainerFeatureVideoFailure, A.deleteTrainerFeatureVideoFailure,
    A.setTrainerFeaturedVideoFailure, A.updateTrainerFeatureVideoPositionFailure, A.incrementTrainerFeatureVideoViewsFailure,
    A.loadTrainerClientsFailure, A.loadTrainerActiveClientsFailure, A.loadTrainerCenterTrainersFailure,
    A.loadTrainerSubscriptionsFailure, A.loadActiveTrainerSubscriptionsFailure, A.loadMyTrainerSubscriptionFailure,
    A.addTrainerSubscriptionFailure, A.updateTrainerSubscriptionFailure,
    A.updateTrainerSubscriptionStatusFailure, A.deleteTrainerSubscriptionFailure,
    A.loadTrainerReviewsFailure, A.loadActiveTrainerReviewsFailure, A.loadMyTrainerReviewsFailure,
    A.loadTrainerReviewLikesFailure, A.addTrainerReviewFailure, A.updateTrainerReviewFailure,
    A.updateTrainerReviewStatusFailure, A.disableTrainerReviewFailure, A.likeTrainerReviewFailure, A.deleteTrainerReviewFailure,
    A.loadTrainerTestimonialsFailure, A.loadMyTrainerTestimonialsFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  // =========================================================================
  // TRAINERS
  // =========================================================================
  on(A.loadTrainersSuccess, (s, { response }) => ({
    ...s, loading: false, trainers: response.data ?? []
  })),
  on(A.loadActiveTrainersSuccess, (s, { response }) => ({
    ...s, loading: false, activeTrainers: response.data ?? []
  })),
  on(A.loadMyTrainerSuccess, (s, { response }) => ({
    ...s, loading: false, currentTrainer: response.data ?? null
  })),
  on(A.addTrainerSuccess, (s, { response }) => ({
    ...s, loading: false,
    currentTrainer: response.data ?? s.currentTrainer,
    trainers: response.data ? [...s.trainers, response.data] : s.trainers,
  })),
  on(A.updateTrainerSuccess, A.updateTrainerPhotoSuccess, (s, { response }) => ({
    ...s, loading: false,
    currentTrainer: response.data ?? s.currentTrainer,
    trainers: response.data ? upsert(s.trainers, response.data) : s.trainers,
    activeTrainers: response.data ? upsert(s.activeTrainers, response.data) : s.activeTrainers,
  })),
  on(A.updateTrainerStatusSuccess, (s, { response }) => ({
    ...s, loading: false,
    currentTrainer: response.data ?? s.currentTrainer,
    trainers: response.data ? upsert(s.trainers, response.data) : s.trainers,
    activeTrainers: response.data ? upsert(s.activeTrainers, response.data) : s.activeTrainers,
  })),
  on(A.likeTrainerSuccess, (s, { response }) => ({
    ...s, loading: false,
    currentTrainer: response.data ?? s.currentTrainer,
    trainers: response.data ? upsert(s.trainers, response.data) : s.trainers,
    activeTrainers: response.data ? upsert(s.activeTrainers, response.data) : s.activeTrainers,
  })),
  on(A.deleteTrainerSuccess, (s, { id }) => ({
    ...s, loading: false,
    currentTrainer: s.currentTrainer?.id === id ? null : s.currentTrainer,
    trainers: s.trainers.filter(t => t.id !== id),
    activeTrainers: s.activeTrainers.filter(t => t.id !== id),
  })),

  // ── Likes ─────────────────────────────────────────────────────────────────
  on(A.loadTrainerLikesSuccess, A.loadAllTrainerLikesSuccess, (s, { response }) => ({
    ...s, loading: false, trainerLikes: response.data ?? []
  })),
  on(A.loadMyTrainerLikesSuccess, (s, { response }) => ({
    ...s, loading: false, myTrainerLikes: response.data ?? []
  })),

  // =========================================================================
  // TRAINER PRICING
  // =========================================================================
  on(A.loadTrainerPricingSuccess, (s, { response }) => ({
    ...s, loading: false, trainerPricing: response.data ?? []
  })),
  on(A.loadMyTrainerPricingSuccess, (s, { response }) => ({
    ...s, loading: false, myTrainerPricing: response.data ?? null
  })),
  on(A.addTrainerPricingSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerPricing: response.data ?? s.myTrainerPricing,
    trainerPricing: response.data ? [...s.trainerPricing, response.data] : s.trainerPricing,
  })),
  on(A.updateTrainerPricingSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerPricing: response.data ?? s.myTrainerPricing,
    trainerPricing: response.data ? upsert(s.trainerPricing, response.data) : s.trainerPricing,
  })),
  on(A.deleteTrainerPricingSuccess, (s, { id }) => ({
    ...s, loading: false,
    myTrainerPricing: s.myTrainerPricing?.id === id ? null : s.myTrainerPricing,
    trainerPricing: s.trainerPricing.filter(p => p.id !== id),
  })),

  // =========================================================================
  // TRAINER BENEFITS
  // =========================================================================
  on(A.loadTrainerBenefitsSuccess, (s, { response }) => ({
    ...s, loading: false, trainerBenefits: response.data ?? []
  })),
  on(A.loadMyTrainerBenefitsSuccess, (s, { response }) => ({
    ...s, loading: false, myTrainerBenefit: response.data ?? null
  })),
  on(A.addTrainerBenefitSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerBenefit: response.data ?? s.myTrainerBenefit,
    trainerBenefits: response.data ? [...s.trainerBenefits, response.data] : s.trainerBenefits,
  })),
  on(A.updateTrainerBenefitSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerBenefit: response.data ?? s.myTrainerBenefit,
    trainerBenefits: response.data ? upsert(s.trainerBenefits, response.data) : s.trainerBenefits,
  })),
  on(A.deleteTrainerBenefitSuccess, (s, { id }) => ({
    ...s, loading: false,
    myTrainerBenefit: null,
    trainerBenefits: s.trainerBenefits.filter(b => b.id !== id),
  })),

  // =========================================================================
  // TRAINER INTRODUCTIONS
  // =========================================================================
  on(A.loadTrainerIntroductionsSuccess, (s, { response }) => ({
    ...s, loading: false, trainerIntroductions: response.data ?? []
  })),
  on(A.loadMyTrainerIntroductionSuccess, (s, { response }) => ({
    ...s, loading: false, myTrainerIntroduction: response.data ?? null
  })),
  on(A.addTrainerIntroductionSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerIntroduction: response.data ?? s.myTrainerIntroduction,
    trainerIntroductions: response.data ? [...s.trainerIntroductions, response.data] : s.trainerIntroductions,
  })),
  on(A.updateTrainerIntroductionSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerIntroduction: response.data ?? s.myTrainerIntroduction,
    trainerIntroductions: response.data ? upsert(s.trainerIntroductions, response.data) : s.trainerIntroductions,
  })),
  on(A.deleteTrainerIntroductionSuccess, (s, { id }) => ({
    ...s, loading: false,
    myTrainerIntroduction: null,
    trainerIntroductions: s.trainerIntroductions.filter(i => i.id !== id),
  })),

  // =========================================================================
  // TRAINER PHOTO ALBUMS
  // =========================================================================
  on(A.loadTrainerPhotoAlbumsSuccess, (s, { response }) => ({
    ...s, loading: false, trainerPhotoAlbums: response.data ?? []
  })),
  on(A.loadMyTrainerPhotoAlbumSuccess, A.loadTrainerPhotosInAlbumSuccess, (s, { response }) => ({
    ...s, loading: false, myTrainerPhotoAlbum: response.data ?? null
  })),
  on(A.addTrainerPhotoAlbumSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerPhotoAlbum: response.data ?? s.myTrainerPhotoAlbum,
    trainerPhotoAlbums: response.data ? [...s.trainerPhotoAlbums, response.data] : s.trainerPhotoAlbums,
  })),
  on(A.updateTrainerPhotoAlbumSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerPhotoAlbum: response.data ?? s.myTrainerPhotoAlbum,
    trainerPhotoAlbums: response.data ? upsert(s.trainerPhotoAlbums, response.data) : s.trainerPhotoAlbums,
  })),
  on(A.deleteTrainerPhotoAlbumSuccess, (s, { id }) => ({
    ...s, loading: false,
    myTrainerPhotoAlbum: s.myTrainerPhotoAlbum?.id === id ? null : s.myTrainerPhotoAlbum,
    trainerPhotoAlbums: s.trainerPhotoAlbums.filter(a => a.id !== id),
  })),

  // =========================================================================
  // TRAINER VIDEO ALBUMS
  // =========================================================================
  on(A.loadTrainerVideoAlbumsSuccess, (s, { response }) => ({
    ...s, loading: false, trainerVideoAlbums: response.data ?? []
  })),
  on(A.loadMyTrainerVideoAlbumSuccess, (s, { response }) => ({
    ...s, loading: false, myTrainerVideoAlbum: response.data ?? null
  })),
  on(A.addTrainerVideoAlbumSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerVideoAlbum: response.data ?? s.myTrainerVideoAlbum,
    trainerVideoAlbums: response.data ? [...s.trainerVideoAlbums, response.data] : s.trainerVideoAlbums,
  })),
  on(A.updateTrainerVideoAlbumSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerVideoAlbum: response.data ?? s.myTrainerVideoAlbum,
    trainerVideoAlbums: response.data ? upsert(s.trainerVideoAlbums, response.data) : s.trainerVideoAlbums,
  })),
  on(A.deleteTrainerVideoAlbumSuccess, (s, { id }) => ({
    ...s, loading: false,
    myTrainerVideoAlbum: s.myTrainerVideoAlbum?.id === id ? null : s.myTrainerVideoAlbum,
    trainerVideoAlbums: s.trainerVideoAlbums.filter(a => a.id !== id),
  })),

  // =========================================================================
  // TRAINER FEATURE VIDEOS
  // =========================================================================
  on(A.loadTrainerFeatureVideosSuccess, (s, { response }) => ({
    ...s, loading: false, trainerFeatureVideos: response.data ?? []
  })),
  on(A.loadMyTrainerFeatureVideosSuccess, (s, { response }) => ({
    ...s, loading: false, myTrainerFeatureVideos: response.data ?? []
  })),
  on(A.loadActiveTrainerFeatureVideosSuccess, (s, { response }) => ({
    ...s, loading: false, activeTrainerFeatureVideos: response.data ?? []
  })),
  on(A.addTrainerFeatureVideoSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerFeatureVideos: response.data ? [...s.myTrainerFeatureVideos, response.data] : s.myTrainerFeatureVideos,
    trainerFeatureVideos: response.data ? [...s.trainerFeatureVideos, response.data] : s.trainerFeatureVideos,
  })),
  on(A.updateTrainerFeatureVideoSuccess, A.updateTrainerFeatureVideoPositionSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerFeatureVideos: response.data ? upsert(s.myTrainerFeatureVideos, response.data) : s.myTrainerFeatureVideos,
    trainerFeatureVideos: response.data ? upsert(s.trainerFeatureVideos, response.data) : s.trainerFeatureVideos,
  })),
  on(A.deleteTrainerFeatureVideoSuccess, (s, { id }) => ({
    ...s, loading: false,
    myTrainerFeatureVideos: s.myTrainerFeatureVideos.filter(v => v.id !== id),
    trainerFeatureVideos: s.trainerFeatureVideos.filter(v => v.id !== id),
    activeTrainerFeatureVideos: s.activeTrainerFeatureVideos.filter(v => v.id !== id),
  })),
  on(A.setTrainerFeaturedVideoSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerFeatureVideos: response.data
      ? s.myTrainerFeatureVideos.map(v =>
        v.id === response.data!.id ? response.data! : { ...v, featured: false })
      : s.myTrainerFeatureVideos,
    trainerFeatureVideos: response.data ? upsert(s.trainerFeatureVideos, response.data) : s.trainerFeatureVideos,
  })),
  on(A.incrementTrainerFeatureVideoViewsSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerFeatureVideos: response.data ? upsert(s.myTrainerFeatureVideos, response.data) : s.myTrainerFeatureVideos,
    trainerFeatureVideos: response.data ? upsert(s.trainerFeatureVideos, response.data) : s.trainerFeatureVideos,
    activeTrainerFeatureVideos: response.data ? upsert(s.activeTrainerFeatureVideos, response.data) : s.activeTrainerFeatureVideos,
  })),

  // =========================================================================
  // TRAINER CLIENTS
  // =========================================================================
  on(A.loadTrainerClientsSuccess, (s, { response }) => ({
    ...s, loading: false, trainerClients: response.data ?? []
  })),
  on(A.loadTrainerActiveClientsSuccess, (s, { response }) => ({
    ...s, loading: false, trainerActiveClients: response.data ?? []
  })),
  on(A.loadTrainerCenterTrainersSuccess, (s, { response }) => ({
    ...s, loading: false, centerTrainers: response.data ?? []
  })),

  // =========================================================================
  // TRAINER SUBSCRIPTIONS
  // =========================================================================
  on(A.loadTrainerSubscriptionsSuccess, (s, { response }) => ({
    ...s, loading: false, trainerSubscriptions: response.data ?? []
  })),
  on(A.loadActiveTrainerSubscriptionsSuccess, (s, { response }) => ({
    ...s, loading: false, activeTrainerSubscriptions: response.data ?? []
  })),
  on(A.loadMyTrainerSubscriptionSuccess, (s, { response }) => ({
    ...s, loading: false, myTrainerSubscription: response.data ?? null
  })),
  on(A.addTrainerSubscriptionSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerSubscription: response.data ?? s.myTrainerSubscription,
    trainerSubscriptions: response.data ? [...s.trainerSubscriptions, response.data] : s.trainerSubscriptions,
  })),
  on(A.updateTrainerSubscriptionSuccess, A.updateTrainerSubscriptionStatusSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerSubscription: response.data ?? s.myTrainerSubscription,
    trainerSubscriptions: response.data ? upsert(s.trainerSubscriptions, response.data) : s.trainerSubscriptions,
    activeTrainerSubscriptions: response.data ? upsert(s.activeTrainerSubscriptions, response.data) : s.activeTrainerSubscriptions,
  })),
  on(A.deleteTrainerSubscriptionSuccess, (s, { id }) => ({
    ...s, loading: false,
    myTrainerSubscription: s.myTrainerSubscription?.id === id ? null : s.myTrainerSubscription,
    trainerSubscriptions: s.trainerSubscriptions.filter(sub => sub.id !== id),
    activeTrainerSubscriptions: s.activeTrainerSubscriptions.filter(sub => sub.id !== id),
  })),

  // =========================================================================
  // TRAINER REVIEWS
  // =========================================================================
  on(A.loadTrainerReviewsSuccess, (s, { response }) => ({
    ...s, loading: false, trainerReviews: response.data ?? []
  })),
  on(A.loadActiveTrainerReviewsSuccess, (s, { response }) => ({
    ...s, loading: false, activeTrainerReviews: response.data ?? []
  })),
  on(A.loadMyTrainerReviewsSuccess, (s, { response }) => ({
    ...s, loading: false, myTrainerReviews: response.data ?? []
  })),
  on(A.loadTrainerReviewLikesSuccess, (s, { response }) => ({
    ...s, loading: false, trainerReviewLikes: response.data ?? []
  })),
  on(A.addTrainerReviewSuccess, (s, { response }) => ({
    ...s, loading: false,
    myTrainerReviews: response.data ? [...s.myTrainerReviews, response.data] : s.myTrainerReviews,
    trainerReviews: response.data ? [...s.trainerReviews, response.data] : s.trainerReviews,
  })),
  on(A.updateTrainerReviewSuccess, A.updateTrainerReviewStatusSuccess, A.likeTrainerReviewSuccess, (s, { response }) => ({
    ...s, loading: false,
    trainerReviews: response.data ? upsert(s.trainerReviews, response.data) : s.trainerReviews,
    myTrainerReviews: response.data ? upsert(s.myTrainerReviews, response.data) : s.myTrainerReviews,
    activeTrainerReviews: response.data ? upsert(s.activeTrainerReviews, response.data) : s.activeTrainerReviews,
  })),
  on(A.disableTrainerReviewSuccess, (s, { response }) => ({
    ...s, loading: false,
    trainerReviews: response.data ? upsert(s.trainerReviews, response.data) : s.trainerReviews,
    myTrainerReviews: response.data ? upsert(s.myTrainerReviews, response.data) : s.myTrainerReviews,
    activeTrainerReviews: response.data
      ? s.activeTrainerReviews.filter(r => r.id !== response.data!.id)
      : s.activeTrainerReviews,
  })),
  on(A.deleteTrainerReviewSuccess, (s, { id }) => ({
    ...s, loading: false,
    trainerReviews: s.trainerReviews.filter(r => r.id !== id),
    myTrainerReviews: s.myTrainerReviews.filter(r => r.id !== id),
    activeTrainerReviews: s.activeTrainerReviews.filter(r => r.id !== id),
  })),

  // =========================================================================
  // TRAINER TESTIMONIALS
  // =========================================================================
  on(A.loadTrainerTestimonialsSuccess, (s, { response }) => ({
    ...s, loading: false, trainerTestimonials: response.data ?? []
  })),
  on(A.loadMyTrainerTestimonialsSuccess, (s, { response }) => ({
    ...s, loading: false, myTrainerTestimonials: response.data ?? []
  })),

  // =========================================================================
  // STOMP REFRESH — re-triggers loadTrainer$ in effects
  // =========================================================================
  on(A.refreshTrainer, state => ({ ...state, loading: true })),

  // =========================================================================
  // STOMP REFRESH — re-triggers loadTrainers$, loadActiveTrainers$ in effects
  // =========================================================================
  on(A.refreshTrainers, state => ({ ...state, loading: true })),
);



