import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import {
    Trainers,
    TrainerBenefits,
    TrainerClients,
    TrainerFeatureVideo,
    TrainerIntroduction,
    TrainerPhotoAlbum,
    TrainerPricing,
    TrainerReview,
    TrainerReviewLikes,
    TrainerSubscription,
    TrainerTestimonials,
    TrainerVideoAlbum,
    TrainerLikes,
} from '../../models/trainers.interface';
import { CenterTrainers } from '../../models/centers.interface';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };
type Id = { id: number };
type Data = { data: any };

// =============================================================================
// TRAINERS
// =============================================================================
export const loadTrainers = createAction('[Trainer] Load All Trainers');
export const loadTrainersSuccess = createAction('[Trainer] Load All Trainers Success', props<Res<Trainers[]>>());
export const loadTrainersFailure = createAction('[Trainer] Load All Trainers Failure', props<Err>());

export const loadActiveTrainers = createAction('[Trainer] Load Active Trainers');
export const loadActiveTrainersSuccess = createAction('[Trainer] Load Active Trainers Success', props<Res<Trainers[]>>());
export const loadActiveTrainersFailure = createAction('[Trainer] Load Active Trainers Failure', props<Err>());

export const loadMyTrainer = createAction('[Trainer] Load My Trainer');
export const loadMyTrainerSuccess = createAction('[Trainer] Load My Trainer Success', props<Res<Trainers>>());
export const loadMyTrainerFailure = createAction('[Trainer] Load My Trainer Failure', props<Err>());

export const addTrainer = createAction('[Trainer] Add Trainer', props<Data>());
export const addTrainerSuccess = createAction('[Trainer] Add Trainer Success', props<Res<Trainers>>());
export const addTrainerFailure = createAction('[Trainer] Add Trainer Failure', props<Err>());

export const updateTrainer = createAction('[Trainer] Update Trainer', props<Data>());
export const updateTrainerSuccess = createAction('[Trainer] Update Trainer Success', props<Res<Trainers>>());
export const updateTrainerFailure = createAction('[Trainer] Update Trainer Failure', props<Err>());

export const updateTrainerPhoto = createAction('[Trainer] Update Trainer Photo', props<Data>());
export const updateTrainerPhotoSuccess = createAction('[Trainer] Update Trainer Photo Success', props<Res<Trainers>>());
export const updateTrainerPhotoFailure = createAction('[Trainer] Update Trainer Photo Failure', props<Err>());

export const updateTrainerStatus = createAction('[Trainer] Update Trainer Status', props<Id>());
export const updateTrainerStatusSuccess = createAction('[Trainer] Update Trainer Status Success', props<Res<Trainers>>());
export const updateTrainerStatusFailure = createAction('[Trainer] Update Trainer Status Failure', props<Err>());

export const deleteTrainer = createAction('[Trainer] Delete Trainer', props<Id>());
export const deleteTrainerSuccess = createAction('[Trainer] Delete Trainer Success', props<Id>());
export const deleteTrainerFailure = createAction('[Trainer] Delete Trainer Failure', props<Err>());

export const likeTrainer = createAction('[Trainer] Like Trainer', props<Id>());
export const likeTrainerSuccess = createAction('[Trainer] Like Trainer Success', props<Res<Trainers>>());
export const likeTrainerFailure = createAction('[Trainer] Like Trainer Failure', props<Err>());

export const loadTrainerLikes = createAction('[Trainer] Load Trainer Likes');
export const loadTrainerLikesSuccess = createAction('[Trainer] Load Trainer Likes Success', props<Res<TrainerLikes[]>>());
export const loadTrainerLikesFailure = createAction('[Trainer] Load Trainer Likes Failure', props<Err>());

export const loadMyTrainerLikes = createAction('[Trainer] Load My Trainer Likes');
export const loadMyTrainerLikesSuccess = createAction('[Trainer] Load My Trainer Likes Success', props<Res<TrainerLikes[]>>());
export const loadMyTrainerLikesFailure = createAction('[Trainer] Load My Trainer Likes Failure', props<Err>());

export const loadAllTrainerLikes = createAction('[Trainer] Load All Trainer Likes');
export const loadAllTrainerLikesSuccess = createAction('[Trainer] Load All Trainer Likes Success', props<Res<TrainerLikes[]>>());
export const loadAllTrainerLikesFailure = createAction('[Trainer] Load All Trainer Likes Failure', props<Err>());

// =============================================================================
// TRAINER PRICING
// =============================================================================
export const loadTrainerPricing = createAction('[Trainer] Load All Trainer Pricing');
export const loadTrainerPricingSuccess = createAction('[Trainer] Load All Trainer Pricing Success', props<Res<TrainerPricing[]>>());
export const loadTrainerPricingFailure = createAction('[Trainer] Load All Trainer Pricing Failure', props<Err>());

export const loadMyTrainerPricing = createAction('[Trainer] Load My Trainer Pricing');
export const loadMyTrainerPricingSuccess = createAction('[Trainer] Load My Trainer Pricing Success', props<Res<TrainerPricing>>());
export const loadMyTrainerPricingFailure = createAction('[Trainer] Load My Trainer Pricing Failure', props<Err>());

export const addTrainerPricing = createAction('[Trainer] Add Trainer Pricing', props<Data>());
export const addTrainerPricingSuccess = createAction('[Trainer] Add Trainer Pricing Success', props<Res<TrainerPricing>>());
export const addTrainerPricingFailure = createAction('[Trainer] Add Trainer Pricing Failure', props<Err>());

export const updateTrainerPricing = createAction('[Trainer] Update Trainer Pricing', props<Data>());
export const updateTrainerPricingSuccess = createAction('[Trainer] Update Trainer Pricing Success', props<Res<TrainerPricing>>());
export const updateTrainerPricingFailure = createAction('[Trainer] Update Trainer Pricing Failure', props<Err>());

export const deleteTrainerPricing = createAction('[Trainer] Delete Trainer Pricing', props<Id>());
export const deleteTrainerPricingSuccess = createAction('[Trainer] Delete Trainer Pricing Success', props<Id>());
export const deleteTrainerPricingFailure = createAction('[Trainer] Delete Trainer Pricing Failure', props<Err>());

// =============================================================================
// TRAINER BENEFITS
// =============================================================================
export const loadTrainerBenefits = createAction('[Trainer] Load All Trainer Benefits');
export const loadTrainerBenefitsSuccess = createAction('[Trainer] Load All Trainer Benefits Success', props<Res<TrainerBenefits[]>>());
export const loadTrainerBenefitsFailure = createAction('[Trainer] Load All Trainer Benefits Failure', props<Err>());

export const loadMyTrainerBenefits = createAction('[Trainer] Load My Trainer Benefits');
export const loadMyTrainerBenefitsSuccess = createAction('[Trainer] Load My Trainer Benefits Success', props<Res<TrainerBenefits>>());
export const loadMyTrainerBenefitsFailure = createAction('[Trainer] Load My Trainer Benefits Failure', props<Err>());

export const addTrainerBenefit = createAction('[Trainer] Add Trainer Benefit', props<Data>());
export const addTrainerBenefitSuccess = createAction('[Trainer] Add Trainer Benefit Success', props<Res<TrainerBenefits>>());
export const addTrainerBenefitFailure = createAction('[Trainer] Add Trainer Benefit Failure', props<Err>());

export const updateTrainerBenefit = createAction('[Trainer] Update Trainer Benefit', props<Data>());
export const updateTrainerBenefitSuccess = createAction('[Trainer] Update Trainer Benefit Success', props<Res<TrainerBenefits>>());
export const updateTrainerBenefitFailure = createAction('[Trainer] Update Trainer Benefit Failure', props<Err>());

export const deleteTrainerBenefit = createAction('[Trainer] Delete Trainer Benefit', props<Id>());
export const deleteTrainerBenefitSuccess = createAction('[Trainer] Delete Trainer Benefit Success', props<Id>());
export const deleteTrainerBenefitFailure = createAction('[Trainer] Delete Trainer Benefit Failure', props<Err>());

// =============================================================================
// TRAINER INTRODUCTION
// =============================================================================
export const loadTrainerIntroductions = createAction('[Trainer] Load All Trainer Introductions');
export const loadTrainerIntroductionsSuccess = createAction('[Trainer] Load All Trainer Introductions Success', props<Res<TrainerIntroduction[]>>());
export const loadTrainerIntroductionsFailure = createAction('[Trainer] Load All Trainer Introductions Failure', props<Err>());

export const loadMyTrainerIntroduction = createAction('[Trainer] Load My Trainer Introduction');
export const loadMyTrainerIntroductionSuccess = createAction('[Trainer] Load My Trainer Introduction Success', props<Res<TrainerIntroduction>>());
export const loadMyTrainerIntroductionFailure = createAction('[Trainer] Load My Trainer Introduction Failure', props<Err>());

export const addTrainerIntroduction = createAction('[Trainer] Add Trainer Introduction', props<Data>());
export const addTrainerIntroductionSuccess = createAction('[Trainer] Add Trainer Introduction Success', props<Res<TrainerIntroduction>>());
export const addTrainerIntroductionFailure = createAction('[Trainer] Add Trainer Introduction Failure', props<Err>());

export const updateTrainerIntroduction = createAction('[Trainer] Update Trainer Introduction', props<Data>());
export const updateTrainerIntroductionSuccess = createAction('[Trainer] Update Trainer Introduction Success', props<Res<TrainerIntroduction>>());
export const updateTrainerIntroductionFailure = createAction('[Trainer] Update Trainer Introduction Failure', props<Err>());

export const deleteTrainerIntroduction = createAction('[Trainer] Delete Trainer Introduction', props<Id>());
export const deleteTrainerIntroductionSuccess = createAction('[Trainer] Delete Trainer Introduction Success', props<Id>());
export const deleteTrainerIntroductionFailure = createAction('[Trainer] Delete Trainer Introduction Failure', props<Err>());

// =============================================================================
// TRAINER PHOTO ALBUM
// =============================================================================
export const loadTrainerPhotoAlbums = createAction('[Trainer] Load All Trainer Photo Albums');
export const loadTrainerPhotoAlbumsSuccess = createAction('[Trainer] Load All Trainer Photo Albums Success', props<Res<TrainerPhotoAlbum[]>>());
export const loadTrainerPhotoAlbumsFailure = createAction('[Trainer] Load All Trainer Photo Albums Failure', props<Err>());

export const loadMyTrainerPhotoAlbum = createAction('[Trainer] Load My Trainer Photo Album');
export const loadMyTrainerPhotoAlbumSuccess = createAction('[Trainer] Load My Trainer Photo Album Success', props<Res<TrainerPhotoAlbum>>());
export const loadMyTrainerPhotoAlbumFailure = createAction('[Trainer] Load My Trainer Photo Album Failure', props<Err>());

export const loadTrainerPhotosInAlbum = createAction('[Trainer] Load Trainer Photos In Album', props<{ albumId: number }>());
export const loadTrainerPhotosInAlbumSuccess = createAction('[Trainer] Load Trainer Photos In Album Success', props<Res<TrainerPhotoAlbum>>());
export const loadTrainerPhotosInAlbumFailure = createAction('[Trainer] Load Trainer Photos In Album Failure', props<Err>());

export const addTrainerPhotoAlbum = createAction('[Trainer] Add Trainer Photo Album', props<Data>());
export const addTrainerPhotoAlbumSuccess = createAction('[Trainer] Add Trainer Photo Album Success', props<Res<TrainerPhotoAlbum>>());
export const addTrainerPhotoAlbumFailure = createAction('[Trainer] Add Trainer Photo Album Failure', props<Err>());

export const updateTrainerPhotoAlbum = createAction('[Trainer] Update Trainer Photo Album', props<Data>());
export const updateTrainerPhotoAlbumSuccess = createAction('[Trainer] Update Trainer Photo Album Success', props<Res<TrainerPhotoAlbum>>());
export const updateTrainerPhotoAlbumFailure = createAction('[Trainer] Update Trainer Photo Album Failure', props<Err>());

export const deleteTrainerPhotoAlbum = createAction('[Trainer] Delete Trainer Photo Album', props<Id>());
export const deleteTrainerPhotoAlbumSuccess = createAction('[Trainer] Delete Trainer Photo Album Success', props<Id>());
export const deleteTrainerPhotoAlbumFailure = createAction('[Trainer] Delete Trainer Photo Album Failure', props<Err>());

// =============================================================================
// TRAINER VIDEO ALBUM
// =============================================================================
export const loadTrainerVideoAlbums = createAction('[Trainer] Load All Trainer Video Albums');
export const loadTrainerVideoAlbumsSuccess = createAction('[Trainer] Load All Trainer Video Albums Success', props<Res<TrainerVideoAlbum[]>>());
export const loadTrainerVideoAlbumsFailure = createAction('[Trainer] Load All Trainer Video Albums Failure', props<Err>());

export const loadMyTrainerVideoAlbum = createAction('[Trainer] Load My Trainer Video Album');
export const loadMyTrainerVideoAlbumSuccess = createAction('[Trainer] Load My Trainer Video Album Success', props<Res<TrainerVideoAlbum>>());
export const loadMyTrainerVideoAlbumFailure = createAction('[Trainer] Load My Trainer Video Album Failure', props<Err>());

export const addTrainerVideoAlbum = createAction('[Trainer] Add Trainer Video Album', props<Data>());
export const addTrainerVideoAlbumSuccess = createAction('[Trainer] Add Trainer Video Album Success', props<Res<TrainerVideoAlbum>>());
export const addTrainerVideoAlbumFailure = createAction('[Trainer] Add Trainer Video Album Failure', props<Err>());

export const updateTrainerVideoAlbum = createAction('[Trainer] Update Trainer Video Album', props<Data>());
export const updateTrainerVideoAlbumSuccess = createAction('[Trainer] Update Trainer Video Album Success', props<Res<TrainerVideoAlbum>>());
export const updateTrainerVideoAlbumFailure = createAction('[Trainer] Update Trainer Video Album Failure', props<Err>());

export const deleteTrainerVideoAlbum = createAction('[Trainer] Delete Trainer Video Album', props<Id>());
export const deleteTrainerVideoAlbumSuccess = createAction('[Trainer] Delete Trainer Video Album Success', props<Id>());
export const deleteTrainerVideoAlbumFailure = createAction('[Trainer] Delete Trainer Video Album Failure', props<Err>());

// =============================================================================
// TRAINER FEATURE VIDEOS
// =============================================================================
export const loadTrainerFeatureVideos = createAction('[Trainer] Load All Trainer Feature Videos');
export const loadTrainerFeatureVideosSuccess = createAction('[Trainer] Load All Trainer Feature Videos Success', props<Res<TrainerFeatureVideo[]>>());
export const loadTrainerFeatureVideosFailure = createAction('[Trainer] Load All Trainer Feature Videos Failure', props<Err>());

export const loadMyTrainerFeatureVideos = createAction('[Trainer] Load My Trainer Feature Videos');
export const loadMyTrainerFeatureVideosSuccess = createAction('[Trainer] Load My Trainer Feature Videos Success', props<Res<TrainerFeatureVideo[]>>());
export const loadMyTrainerFeatureVideosFailure = createAction('[Trainer] Load My Trainer Feature Videos Failure', props<Err>());

export const loadActiveTrainerFeatureVideos = createAction('[Trainer] Load Active Trainer Feature Videos', props<{ trainerId: number }>());
export const loadActiveTrainerFeatureVideosSuccess = createAction('[Trainer] Load Active Trainer Feature Videos Success', props<Res<TrainerFeatureVideo[]>>());
export const loadActiveTrainerFeatureVideosFailure = createAction('[Trainer] Load Active Trainer Feature Videos Failure', props<Err>());

export const addTrainerFeatureVideo = createAction('[Trainer] Add Trainer Feature Video', props<Data>());
export const addTrainerFeatureVideoSuccess = createAction('[Trainer] Add Trainer Feature Video Success', props<Res<TrainerFeatureVideo>>());
export const addTrainerFeatureVideoFailure = createAction('[Trainer] Add Trainer Feature Video Failure', props<Err>());

export const updateTrainerFeatureVideo = createAction('[Trainer] Update Trainer Feature Video', props<Data>());
export const updateTrainerFeatureVideoSuccess = createAction('[Trainer] Update Trainer Feature Video Success', props<Res<TrainerFeatureVideo>>());
export const updateTrainerFeatureVideoFailure = createAction('[Trainer] Update Trainer Feature Video Failure', props<Err>());

export const deleteTrainerFeatureVideo = createAction('[Trainer] Delete Trainer Feature Video', props<Id>());
export const deleteTrainerFeatureVideoSuccess = createAction('[Trainer] Delete Trainer Feature Video Success', props<Id>());
export const deleteTrainerFeatureVideoFailure = createAction('[Trainer] Delete Trainer Feature Video Failure', props<Err>());

export const setTrainerFeaturedVideo = createAction('[Trainer] Set Trainer Featured Video', props<Id>());
export const setTrainerFeaturedVideoSuccess = createAction('[Trainer] Set Trainer Featured Video Success', props<Res<TrainerFeatureVideo>>());
export const setTrainerFeaturedVideoFailure = createAction('[Trainer] Set Trainer Featured Video Failure', props<Err>());

export const updateTrainerFeatureVideoPosition = createAction('[Trainer] Update Trainer Feature Video Position', props<{ id: number; position: number }>());
export const updateTrainerFeatureVideoPositionSuccess = createAction('[Trainer] Update Trainer Feature Video Position Success', props<Res<TrainerFeatureVideo>>());
export const updateTrainerFeatureVideoPositionFailure = createAction('[Trainer] Update Trainer Feature Video Position Failure', props<Err>());

export const incrementTrainerFeatureVideoViews = createAction('[Trainer] Increment Trainer Feature Video Views', props<Id>());
export const incrementTrainerFeatureVideoViewsSuccess = createAction('[Trainer] Increment Trainer Feature Video Views Success', props<Res<TrainerFeatureVideo>>());
export const incrementTrainerFeatureVideoViewsFailure = createAction('[Trainer] Increment Trainer Feature Video Views Failure', props<Err>());

// =============================================================================
// TRAINER CLIENTS
// =============================================================================
export const loadTrainerClients = createAction('[Trainer] Load Trainer Clients');
export const loadTrainerClientsSuccess = createAction('[Trainer] Load Trainer Clients Success', props<Res<TrainerClients[]>>());
export const loadTrainerClientsFailure = createAction('[Trainer] Load Trainer Clients Failure', props<Err>());

export const loadTrainerActiveClients = createAction('[Trainer] Load Trainer Active Clients');
export const loadTrainerActiveClientsSuccess = createAction('[Trainer] Load Trainer Active Clients Success', props<Res<TrainerClients[]>>());
export const loadTrainerActiveClientsFailure = createAction('[Trainer] Load Trainer Active Clients Failure', props<Err>());

export const loadTrainerCenterTrainers = createAction('[Trainer] Load Trainer Center Trainers');
export const loadTrainerCenterTrainersSuccess = createAction('[Trainer] Load Trainer Center Trainers Success', props<Res<CenterTrainers[]>>());
export const loadTrainerCenterTrainersFailure = createAction('[Trainer] Load Trainer Center Trainers Failure', props<Err>());

// =============================================================================
// TRAINER SUBSCRIPTIONS
// =============================================================================
export const loadTrainerSubscriptions = createAction('[Trainer] Load All Trainer Subscriptions');
export const loadTrainerSubscriptionsSuccess = createAction('[Trainer] Load All Trainer Subscriptions Success', props<Res<TrainerSubscription[]>>());
export const loadTrainerSubscriptionsFailure = createAction('[Trainer] Load All Trainer Subscriptions Failure', props<Err>());

export const loadActiveTrainerSubscriptions = createAction('[Trainer] Load Active Trainer Subscriptions');
export const loadActiveTrainerSubscriptionsSuccess = createAction('[Trainer] Load Active Trainer Subscriptions Success', props<Res<TrainerSubscription[]>>());
export const loadActiveTrainerSubscriptionsFailure = createAction('[Trainer] Load Active Trainer Subscriptions Failure', props<Err>());

export const loadMyTrainerSubscription = createAction('[Trainer] Load My Trainer Subscription');
export const loadMyTrainerSubscriptionSuccess = createAction('[Trainer] Load My Trainer Subscription Success', props<Res<TrainerSubscription>>());
export const loadMyTrainerSubscriptionFailure = createAction('[Trainer] Load My Trainer Subscription Failure', props<Err>());

export const addTrainerSubscription = createAction('[Trainer] Add Trainer Subscription', props<Data>());
export const addTrainerSubscriptionSuccess = createAction('[Trainer] Add Trainer Subscription Success', props<Res<TrainerSubscription>>());
export const addTrainerSubscriptionFailure = createAction('[Trainer] Add Trainer Subscription Failure', props<Err>());

export const updateTrainerSubscription = createAction('[Trainer] Update Trainer Subscription', props<Data>());
export const updateTrainerSubscriptionSuccess = createAction('[Trainer] Update Trainer Subscription Success', props<Res<TrainerSubscription>>());
export const updateTrainerSubscriptionFailure = createAction('[Trainer] Update Trainer Subscription Failure', props<Err>());

export const updateTrainerSubscriptionStatus = createAction('[Trainer] Update Trainer Subscription Status', props<{ status: string; activationCode: string }>());
export const updateTrainerSubscriptionStatusSuccess = createAction('[Trainer] Update Trainer Subscription Status Success', props<Res<TrainerSubscription>>());
export const updateTrainerSubscriptionStatusFailure = createAction('[Trainer] Update Trainer Subscription Status Failure', props<Err>());

export const deleteTrainerSubscription = createAction('[Trainer] Delete Trainer Subscription', props<Id>());
export const deleteTrainerSubscriptionSuccess = createAction('[Trainer] Delete Trainer Subscription Success', props<Id>());
export const deleteTrainerSubscriptionFailure = createAction('[Trainer] Delete Trainer Subscription Failure', props<Err>());

// =============================================================================
// TRAINER REVIEWS
// =============================================================================
export const loadTrainerReviews = createAction('[Trainer] Load All Trainer Reviews');
export const loadTrainerReviewsSuccess = createAction('[Trainer] Load All Trainer Reviews Success', props<Res<TrainerReview[]>>());
export const loadTrainerReviewsFailure = createAction('[Trainer] Load All Trainer Reviews Failure', props<Err>());

export const loadActiveTrainerReviews = createAction('[Trainer] Load Active Trainer Reviews', props<Id>());
export const loadActiveTrainerReviewsSuccess = createAction('[Trainer] Load Active Trainer Reviews Success', props<Res<TrainerReview[]>>());
export const loadActiveTrainerReviewsFailure = createAction('[Trainer] Load Active Trainer Reviews Failure', props<Err>());

export const loadMyTrainerReviews = createAction('[Trainer] Load My Trainer Reviews');
export const loadMyTrainerReviewsSuccess = createAction('[Trainer] Load My Trainer Reviews Success', props<Res<TrainerReview[]>>());
export const loadMyTrainerReviewsFailure = createAction('[Trainer] Load My Trainer Reviews Failure', props<Err>());

export const loadTrainerReviewLikes = createAction('[Trainer] Load Trainer Review Likes');
export const loadTrainerReviewLikesSuccess = createAction('[Trainer] Load Trainer Review Likes Success', props<Res<TrainerReviewLikes[]>>());
export const loadTrainerReviewLikesFailure = createAction('[Trainer] Load Trainer Review Likes Failure', props<Err>());

export const addTrainerReview = createAction('[Trainer] Add Trainer Review', props<Data>());
export const addTrainerReviewSuccess = createAction('[Trainer] Add Trainer Review Success', props<Res<TrainerReview>>());
export const addTrainerReviewFailure = createAction('[Trainer] Add Trainer Review Failure', props<Err>());

export const updateTrainerReview = createAction('[Trainer] Update Trainer Review', props<Data>());
export const updateTrainerReviewSuccess = createAction('[Trainer] Update Trainer Review Success', props<Res<TrainerReview>>());
export const updateTrainerReviewFailure = createAction('[Trainer] Update Trainer Review Failure', props<Err>());

export const updateTrainerReviewStatus = createAction('[Trainer] Update Trainer Review Status', props<Id>());
export const updateTrainerReviewStatusSuccess = createAction('[Trainer] Update Trainer Review Status Success', props<Res<TrainerReview>>());
export const updateTrainerReviewStatusFailure = createAction('[Trainer] Update Trainer Review Status Failure', props<Err>());

export const disableTrainerReview = createAction('[Trainer] Disable Trainer Review', props<Id>());
export const disableTrainerReviewSuccess = createAction('[Trainer] Disable Trainer Review Success', props<Res<TrainerReview>>());
export const disableTrainerReviewFailure = createAction('[Trainer] Disable Trainer Review Failure', props<Err>());

export const likeTrainerReview = createAction('[Trainer] Like Trainer Review', props<Id>());
export const likeTrainerReviewSuccess = createAction('[Trainer] Like Trainer Review Success', props<Res<TrainerReview>>());
export const likeTrainerReviewFailure = createAction('[Trainer] Like Trainer Review Failure', props<Err>());

export const deleteTrainerReview = createAction('[Trainer] Delete Trainer Review', props<Id>());
export const deleteTrainerReviewSuccess = createAction('[Trainer] Delete Trainer Review Success', props<Id>());
export const deleteTrainerReviewFailure = createAction('[Trainer] Delete Trainer Review Failure', props<Err>());

// =============================================================================
// TRAINER TESTIMONIALS
// =============================================================================
export const loadTrainerTestimonials = createAction('[Trainer] Load All Trainer Testimonials');
export const loadTrainerTestimonialsSuccess = createAction('[Trainer] Load All Trainer Testimonials Success', props<Res<TrainerTestimonials[]>>());
export const loadTrainerTestimonialsFailure = createAction('[Trainer] Load All Trainer Testimonials Failure', props<Err>());

export const loadMyTrainerTestimonials = createAction('[Trainer] Load My Trainer Testimonials');
export const loadMyTrainerTestimonialsSuccess = createAction('[Trainer] Load My Trainer Testimonials Success', props<Res<TrainerTestimonials[]>>());
export const loadMyTrainerTestimonialsFailure = createAction('[Trainer] Load My Trainer Testimonials Failure', props<Err>());

// REFRESH (WebSocket)
export const refreshTrainer = createAction('[Trainer] Refresh Trainer');
export const refreshTrainers = createAction('[Trainer] Refresh Trainers');