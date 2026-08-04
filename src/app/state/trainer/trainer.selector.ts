import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TrainerState } from './trainer.state';
import { trainerFeatureKey } from './trainer.reducer';

const selectState = createFeatureSelector<TrainerState>(trainerFeatureKey);

// ── Async ─────────────────────────────────────────────────────────────────────
export const selectTrainerLoading = createSelector(selectState, s => s.loading);
export const selectTrainerError   = createSelector(selectState, s => s.error);

// ── Trainers ──────────────────────────────────────────────────────────────────
export const selectTrainers       = createSelector(selectState, s => s.trainers);
export const selectActiveTrainers = createSelector(selectState, s => s.activeTrainers);
export const selectCurrentTrainer = createSelector(selectState, s => s.currentTrainer);

// ── Likes ─────────────────────────────────────────────────────────────────────
export const selectTrainerLikes   = createSelector(selectState, s => s.trainerLikes);
export const selectMyTrainerLikes = createSelector(selectState, s => s.myTrainerLikes);

// ── Pricing ───────────────────────────────────────────────────────────────────
export const selectTrainerPricing   = createSelector(selectState, s => s.trainerPricing);
export const selectMyTrainerPricing = createSelector(selectState, s => s.myTrainerPricing);

// ── Benefits ──────────────────────────────────────────────────────────────────
export const selectTrainerBenefits   = createSelector(selectState, s => s.trainerBenefits);
export const selectMyTrainerBenefit  = createSelector(selectState, s => s.myTrainerBenefit);

// ── Introductions ─────────────────────────────────────────────────────────────
export const selectTrainerIntroductions  = createSelector(selectState, s => s.trainerIntroductions);
export const selectMyTrainerIntroduction = createSelector(selectState, s => s.myTrainerIntroduction);

// ── Feature Videos ────────────────────────────────────────────────────────────
export const selectTrainerFeatureVideos        = createSelector(selectState, s => s.trainerFeatureVideos);
export const selectMyTrainerFeatureVideos      = createSelector(selectState, s => s.myTrainerFeatureVideos);
export const selectActiveTrainerFeatureVideos  = createSelector(selectState, s => s.activeTrainerFeatureVideos);

// ── Photo Albums ──────────────────────────────────────────────────────────────
export const selectTrainerPhotoAlbums   = createSelector(selectState, s => s.trainerPhotoAlbums);
export const selectMyTrainerPhotoAlbum  = createSelector(selectState, s => s.myTrainerPhotoAlbum);

// ── Video Albums ──────────────────────────────────────────────────────────────
export const selectTrainerVideoAlbums   = createSelector(selectState, s => s.trainerVideoAlbums);
export const selectMyTrainerVideoAlbum  = createSelector(selectState, s => s.myTrainerVideoAlbum);

// ── Clients ───────────────────────────────────────────────────────────────────
export const selectTrainerClients       = createSelector(selectState, s => s.trainerClients);
export const selectTrainerActiveClients = createSelector(selectState, s => s.trainerActiveClients);
export const selectTrainerCenterTrainers = createSelector(selectState, s => s.centerTrainers);
export const selectMyTrainerCenterTrainers = createSelector(selectState, s => s.myCenterTrainers);

// ── Subscriptions ─────────────────────────────────────────────────────────────
export const selectTrainerSubscriptions        = createSelector(selectState, s => s.trainerSubscriptions);
export const selectActiveTrainerSubscriptions  = createSelector(selectState, s => s.activeTrainerSubscriptions);
export const selectMyTrainerSubscription       = createSelector(selectState, s => s.myTrainerSubscription);

// ── Reviews ───────────────────────────────────────────────────────────────────
export const selectTrainerReviews        = createSelector(selectState, s => s.trainerReviews);
export const selectActiveTrainerReviews  = createSelector(selectState, s => s.activeTrainerReviews);
export const selectMyTrainerReviews      = createSelector(selectState, s => s.myTrainerReviews);
export const selectTrainerReviewLikes    = createSelector(selectState, s => s.trainerReviewLikes);

// ── Testimonials ──────────────────────────────────────────────────────────────
export const selectTrainerTestimonials   = createSelector(selectState, s => s.trainerTestimonials);
export const selectMyTrainerTestimonials = createSelector(selectState, s => s.myTrainerTestimonials);