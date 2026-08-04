import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import {
    Centers,
    CenterLikes,
    CenterAnnouncements,
    CenterEquipment,
    CenterIntroduction,
    CenterLocations,
    CenterPhotoAlbum,
    CenterPricing,
    CenterTrainers,
    CenterVideoAlbum,
    CenterReviews,
} from '../../models/centers.interface';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };
type Id = { id: number };
type Data = { data: any };

// =============================================================================
// CENTER CRUD
// =============================================================================
export const loadCenters = createAction('[Center] Load All Centers');
export const loadCentersSuccess = createAction('[Center] Load All Centers Success', props<Res<Centers[]>>());
export const loadCentersFailure = createAction('[Center] Load All Centers Failure', props<Err>());

export const loadActiveCenters = createAction('[Center] Load Active Centers');
export const loadActiveCentersSuccess = createAction('[Center] Load Active Centers Success', props<Res<Centers[]>>());
export const loadActiveCentersFailure = createAction('[Center] Load Active Centers Failure', props<Err>());

export const loadCenter = createAction('[Center] Load My Center');
export const loadCenterSuccess = createAction('[Center] Load My Center Success', props<Res<Centers>>());
export const loadCenterFailure = createAction('[Center] Load My Center Failure', props<Err>());

export const loadCenterByUserId = createAction('[Center] Load Center By UserId', props<{ userId: number }>());
export const loadCenterByUserIdSuccess = createAction('[Center] Load Center By UserId Success', props<Res<Centers>>());
export const loadCenterByUserIdFailure = createAction('[Center] Load Center By UserId Failure', props<Err>());

export const addCenter = createAction('[Center] Add Center', props<Data>());
export const addCenterSuccess = createAction('[Center] Add Center Success', props<Res<Centers>>());
export const addCenterFailure = createAction('[Center] Add Center Failure', props<Err>());

export const updateCenter = createAction('[Center] Update Center', props<Data>());
export const updateCenterSuccess = createAction('[Center] Update Center Success', props<Res<Centers>>());
export const updateCenterFailure = createAction('[Center] Update Center Failure', props<Err>());

export const updateCenterPhoto = createAction('[Center] Update Center Photo', props<Data>());
export const updateCenterPhotoSuccess = createAction('[Center] Update Center Photo Success', props<Res<Centers>>());
export const updateCenterPhotoFailure = createAction('[Center] Update Center Photo Failure', props<Err>());

export const updateCenterStatus = createAction('[Center] Update Center Status', props<Id>());
export const updateCenterStatusSuccess = createAction('[Center] Update Center Status Success', props<Res<Centers>>());
export const updateCenterStatusFailure = createAction('[Center] Update Center Status Failure', props<Err>());

export const likeCenter = createAction('[Center] Like Center', props<Id>());
export const likeCenterSuccess = createAction('[Center] Like Center Success', props<Res<Centers>>());
export const likeCenterFailure = createAction('[Center] Like Center Failure', props<Err>());

export const deleteCenter = createAction('[Center] Delete Center', props<Id>());
export const deleteCenterSuccess = createAction('[Center] Delete Center Success', props<Id>());
export const deleteCenterFailure = createAction('[Center] Delete Center Failure', props<Err>());

export const loadCenterLikes = createAction('[Center] Load Center Likes');
export const loadCenterLikesSuccess = createAction('[Center] Load Center Likes Success', props<Res<CenterLikes[]>>());
export const loadCenterLikesFailure = createAction('[Center] Load Center Likes Failure', props<Err>());

export const updateMyCenterTrainers = createAction('[Center] Update My Center Trainers', props<Data>());
export const updateMyCenterTrainersSuccess = createAction('[Center] Update My Center Trainers Success', props<Res<string>>());
export const updateMyCenterTrainersFailure = createAction('[Center] Update My Center Trainers Failure', props<Err>());

// =============================================================================
// ANNOUNCEMENTS
// =============================================================================
export const loadAllCenterAnnouncements = createAction('[Center] Load All Center Announcements');
export const loadAllCenterAnnouncementsSuccess = createAction('[Center] Load All Center Announcements Success', props<Res<CenterAnnouncements[]>>());
export const loadAllCenterAnnouncementsFailure = createAction('[Center] Load All Center Announcements Failure', props<Err>());

export const loadMyCenterAnnouncements = createAction('[Center] Load My Center Announcements');
export const loadMyCenterAnnouncementsSuccess = createAction('[Center] Load My Center Announcements Success', props<Res<CenterAnnouncements[]>>());
export const loadMyCenterAnnouncementsFailure = createAction('[Center] Load My Center Announcements Failure', props<Err>());

export const loadActiveCenterAnnouncements = createAction('[Center] Load Active Center Announcements', props<Id>());
export const loadActiveCenterAnnouncementsSuccess = createAction('[Center] Load Active Center Announcements Success', props<Res<CenterAnnouncements[]>>());
export const loadActiveCenterAnnouncementsFailure = createAction('[Center] Load Active Center Announcements Failure', props<Err>());

export const addCenterAnnouncement = createAction('[Center] Add Center Announcement', props<Data>());
export const addCenterAnnouncementSuccess = createAction('[Center] Add Center Announcement Success', props<Res<CenterAnnouncements>>());
export const addCenterAnnouncementFailure = createAction('[Center] Add Center Announcement Failure', props<Err>());

export const updateCenterAnnouncement = createAction('[Center] Update Center Announcement', props<Data>());
export const updateCenterAnnouncementSuccess = createAction('[Center] Update Center Announcement Success', props<Res<CenterAnnouncements>>());
export const updateCenterAnnouncementFailure = createAction('[Center] Update Center Announcement Failure', props<Err>());

export const updateCenterAnnouncementStatus = createAction('[Center] Update Center Announcement Status', props<Id>());
export const updateCenterAnnouncementStatusSuccess = createAction('[Center] Update Center Announcement Status Success', props<Res<CenterAnnouncements>>());
export const updateCenterAnnouncementStatusFailure = createAction('[Center] Update Center Announcement Status Failure', props<Err>());

export const deleteCenterAnnouncement = createAction('[Center] Delete Center Announcement', props<Id>());
export const deleteCenterAnnouncementSuccess = createAction('[Center] Delete Center Announcement Success', props<Id>());
export const deleteCenterAnnouncementFailure = createAction('[Center] Delete Center Announcement Failure', props<Err>());

// =============================================================================
// EQUIPMENT
// =============================================================================
export const loadAllCenterEquipment = createAction('[Center] Load All Center Equipment');
export const loadAllCenterEquipmentSuccess = createAction('[Center] Load All Center Equipment Success', props<Res<CenterEquipment[]>>());
export const loadAllCenterEquipmentFailure = createAction('[Center] Load All Center Equipment Failure', props<Err>());

export const loadMyCenterEquipment = createAction('[Center] Load My Center Equipment');
export const loadMyCenterEquipmentSuccess = createAction('[Center] Load My Center Equipment Success', props<Res<CenterEquipment[]>>());
export const loadMyCenterEquipmentFailure = createAction('[Center] Load My Center Equipment Failure', props<Err>());

export const addCenterEquipment = createAction('[Center] Add Center Equipment', props<Data>());
export const addCenterEquipmentSuccess = createAction('[Center] Add Center Equipment Success', props<Res<CenterEquipment>>());
export const addCenterEquipmentFailure = createAction('[Center] Add Center Equipment Failure', props<Err>());

export const updateCenterEquipment = createAction('[Center] Update Center Equipment', props<Data>());
export const updateCenterEquipmentSuccess = createAction('[Center] Update Center Equipment Success', props<Res<CenterEquipment>>());
export const updateCenterEquipmentFailure = createAction('[Center] Update Center Equipment Failure', props<Err>());

export const deleteCenterEquipment = createAction('[Center] Delete Center Equipment', props<Id>());
export const deleteCenterEquipmentSuccess = createAction('[Center] Delete Center Equipment Success', props<Id>());
export const deleteCenterEquipmentFailure = createAction('[Center] Delete Center Equipment Failure', props<Err>());

// =============================================================================
// INTRODUCTIONS
// =============================================================================
export const loadAllCenterIntroductions = createAction('[Center] Load All Center Introductions');
export const loadAllCenterIntroductionsSuccess = createAction('[Center] Load All Center Introductions Success', props<Res<CenterIntroduction[]>>());
export const loadAllCenterIntroductionsFailure = createAction('[Center] Load All Center Introductions Failure', props<Err>());

export const loadMyCenterIntroductions = createAction('[Center] Load My Center Introductions');
export const loadMyCenterIntroductionsSuccess = createAction('[Center] Load My Center Introductions Success', props<Res<CenterIntroduction[]>>());
export const loadMyCenterIntroductionsFailure = createAction('[Center] Load My Center Introductions Failure', props<Err>());

export const addCenterIntroduction = createAction('[Center] Add Center Introduction', props<Data>());
export const addCenterIntroductionSuccess = createAction('[Center] Add Center Introduction Success', props<Res<CenterIntroduction>>());
export const addCenterIntroductionFailure = createAction('[Center] Add Center Introduction Failure', props<Err>());

export const updateCenterIntroduction = createAction('[Center] Update Center Introduction', props<Data>());
export const updateCenterIntroductionSuccess = createAction('[Center] Update Center Introduction Success', props<Res<CenterIntroduction>>());
export const updateCenterIntroductionFailure = createAction('[Center] Update Center Introduction Failure', props<Err>());

export const deleteCenterIntroduction = createAction('[Center] Delete Center Introduction', props<Id>());
export const deleteCenterIntroductionSuccess = createAction('[Center] Delete Center Introduction Success', props<Id>());
export const deleteCenterIntroductionFailure = createAction('[Center] Delete Center Introduction Failure', props<Err>());

// =============================================================================
// LOCATIONS
// =============================================================================
export const loadAllCenterLocations = createAction('[Center] Load All Center Locations');
export const loadAllCenterLocationsSuccess = createAction('[Center] Load All Center Locations Success', props<Res<CenterLocations[]>>());
export const loadAllCenterLocationsFailure = createAction('[Center] Load All Center Locations Failure', props<Err>());

export const loadMyCenterLocations = createAction('[Center] Load My Center Locations');
export const loadMyCenterLocationsSuccess = createAction('[Center] Load My Center Locations Success', props<Res<CenterLocations[]>>());
export const loadMyCenterLocationsFailure = createAction('[Center] Load My Center Locations Failure', props<Err>());

export const addCenterLocation = createAction('[Center] Add Center Location', props<Data>());
export const addCenterLocationSuccess = createAction('[Center] Add Center Location Success', props<Res<CenterLocations>>());
export const addCenterLocationFailure = createAction('[Center] Add Center Location Failure', props<Err>());

export const updateCenterLocation = createAction('[Center] Update Center Location', props<Data>());
export const updateCenterLocationSuccess = createAction('[Center] Update Center Location Success', props<Res<CenterLocations>>());
export const updateCenterLocationFailure = createAction('[Center] Update Center Location Failure', props<Err>());

export const deleteCenterLocation = createAction('[Center] Delete Center Location', props<Id>());
export const deleteCenterLocationSuccess = createAction('[Center] Delete Center Location Success', props<Id>());
export const deleteCenterLocationFailure = createAction('[Center] Delete Center Location Failure', props<Err>());

// =============================================================================
// PHOTO ALBUMS
// =============================================================================
export const loadAllCenterPhotoAlbums = createAction('[Center] Load All Center Photo Albums');
export const loadAllCenterPhotoAlbumsSuccess = createAction('[Center] Load All Center Photo Albums Success', props<Res<CenterPhotoAlbum[]>>());
export const loadAllCenterPhotoAlbumsFailure = createAction('[Center] Load All Center Photo Albums Failure', props<Err>());

export const loadMyCenterPhotoAlbums = createAction('[Center] Load My Center Photo Albums');
export const loadMyCenterPhotoAlbumsSuccess = createAction('[Center] Load My Center Photo Albums Success', props<Res<CenterPhotoAlbum[]>>());
export const loadMyCenterPhotoAlbumsFailure = createAction('[Center] Load My Center Photo Albums Failure', props<Err>());

export const addCenterPhotoAlbum = createAction('[Center] Add Center Photo Album', props<Data>());
export const addCenterPhotoAlbumSuccess = createAction('[Center] Add Center Photo Album Success', props<Res<CenterPhotoAlbum>>());
export const addCenterPhotoAlbumFailure = createAction('[Center] Add Center Photo Album Failure', props<Err>());

export const updateCenterPhotoAlbum = createAction('[Center] Update Center Photo Album', props<Data>());
export const updateCenterPhotoAlbumSuccess = createAction('[Center] Update Center Photo Album Success', props<Res<CenterPhotoAlbum>>());
export const updateCenterPhotoAlbumFailure = createAction('[Center] Update Center Photo Album Failure', props<Err>());

export const deleteCenterPhotoAlbum = createAction('[Center] Delete Center Photo Album', props<Id>());
export const deleteCenterPhotoAlbumSuccess = createAction('[Center] Delete Center Photo Album Success', props<Id>());
export const deleteCenterPhotoAlbumFailure = createAction('[Center] Delete Center Photo Album Failure', props<Err>());

// =============================================================================
// PRICING
// =============================================================================
export const loadAllCenterPricing = createAction('[Center] Load All Center Pricing');
export const loadAllCenterPricingSuccess = createAction('[Center] Load All Center Pricing Success', props<Res<CenterPricing[]>>());
export const loadAllCenterPricingFailure = createAction('[Center] Load All Center Pricing Failure', props<Err>());

export const loadMyCenterPricing = createAction('[Center] Load My Center Pricing');
export const loadMyCenterPricingSuccess = createAction('[Center] Load My Center Pricing Success', props<Res<CenterPricing>>());
export const loadMyCenterPricingFailure = createAction('[Center] Load My Center Pricing Failure', props<Err>());

export const addCenterPricing = createAction('[Center] Add Center Pricing', props<Data>());
export const addCenterPricingSuccess = createAction('[Center] Add Center Pricing Success', props<Res<CenterPricing>>());
export const addCenterPricingFailure = createAction('[Center] Add Center Pricing Failure', props<Err>());

export const updateCenterPricing = createAction('[Center] Update Center Pricing', props<Data>());
export const updateCenterPricingSuccess = createAction('[Center] Update Center Pricing Success', props<Res<CenterPricing>>());
export const updateCenterPricingFailure = createAction('[Center] Update Center Pricing Failure', props<Err>());

export const deleteCenterPricing = createAction('[Center] Delete Center Pricing', props<Id>());
export const deleteCenterPricingSuccess = createAction('[Center] Delete Center Pricing Success', props<Id>());
export const deleteCenterPricingFailure = createAction('[Center] Delete Center Pricing Failure', props<Err>());

// =============================================================================
// CENTER TRAINERS
// =============================================================================
export const loadAllCenterTrainers = createAction('[Center] Load All Center Trainers');
export const loadAllCenterTrainersSuccess = createAction('[Center] Load All Center Trainers Success', props<Res<CenterTrainers[]>>());
export const loadAllCenterTrainersFailure = createAction('[Center] Load All Center Trainers Failure', props<Err>());

export const loadMyCenterTrainers = createAction('[Center] Load My Center Trainers');
export const loadMyCenterTrainersSuccess = createAction('[Center] Load My Center Trainers Success', props<Res<CenterTrainers[]>>());
export const loadMyCenterTrainersFailure = createAction('[Center] Load My Center Trainers Failure', props<Err>());

export const addCenterTrainer = createAction('[Center] Add Center Trainer', props<Data>());
export const addCenterTrainerSuccess = createAction('[Center] Add Center Trainer Success', props<Res<CenterTrainers>>());
export const addCenterTrainerFailure = createAction('[Center] Add Center Trainer Failure', props<Err>());

export const updateCenterTrainerStatus = createAction('[Center] Update Center Trainer Status', props<Id>());
export const updateCenterTrainerStatusSuccess = createAction('[Center] Update Center Trainer Status Success', props<Res<CenterTrainers>>());
export const updateCenterTrainerStatusFailure = createAction('[Center] Update Center Trainer Status Failure', props<Err>());

export const deleteCenterTrainer = createAction('[Center] Delete Center Trainer', props<Id>());
export const deleteCenterTrainerSuccess = createAction('[Center] Delete Center Trainer Success', props<Id>());
export const deleteCenterTrainerFailure = createAction('[Center] Delete Center Trainer Failure', props<Err>());

// =============================================================================
// VIDEO ALBUMS
// =============================================================================
export const loadAllCenterVideoAlbums = createAction('[Center] Load All Center Video Albums');
export const loadAllCenterVideoAlbumsSuccess = createAction('[Center] Load All Center Video Albums Success', props<Res<CenterVideoAlbum[]>>());
export const loadAllCenterVideoAlbumsFailure = createAction('[Center] Load All Center Video Albums Failure', props<Err>());

export const loadMyCenterVideoAlbums = createAction('[Center] Load My Center Video Albums');
export const loadMyCenterVideoAlbumsSuccess = createAction('[Center] Load My Center Video Albums Success', props<Res<CenterVideoAlbum[]>>());
export const loadMyCenterVideoAlbumsFailure = createAction('[Center] Load My Center Video Albums Failure', props<Err>());

export const addCenterVideoAlbum = createAction('[Center] Add Center Video Album', props<Data>());
export const addCenterVideoAlbumSuccess = createAction('[Center] Add Center Video Album Success', props<Res<CenterVideoAlbum>>());
export const addCenterVideoAlbumFailure = createAction('[Center] Add Center Video Album Failure', props<Err>());

export const updateCenterVideoAlbum = createAction('[Center] Update Center Video Album', props<Data>());
export const updateCenterVideoAlbumSuccess = createAction('[Center] Update Center Video Album Success', props<Res<CenterVideoAlbum>>());
export const updateCenterVideoAlbumFailure = createAction('[Center] Update Center Video Album Failure', props<Err>());

export const deleteCenterVideoAlbum = createAction('[Center] Delete Center Video Album', props<Id>());
export const deleteCenterVideoAlbumSuccess = createAction('[Center] Delete Center Video Album Success', props<Id>());
export const deleteCenterVideoAlbumFailure = createAction('[Center] Delete Center Video Album Failure', props<Err>());

// =============================================================================
// REVIEWS
// =============================================================================
export const loadAllCenterReviews = createAction('[Center] Load All Center Reviews');
export const loadAllCenterReviewsSuccess = createAction('[Center] Load All Center Reviews Success', props<Res<CenterReviews[]>>());
export const loadAllCenterReviewsFailure = createAction('[Center] Load All Center Reviews Failure', props<Err>());

export const loadMyCenterReviews = createAction('[Center] Load My Center Reviews');
export const loadMyCenterReviewsSuccess = createAction('[Center] Load My Center Reviews Success', props<Res<CenterReviews[]>>());
export const loadMyCenterReviewsFailure = createAction('[Center] Load My Center Reviews Failure', props<Err>());

export const loadActiveCenterReviews = createAction('[Center] Load Active Center Reviews', props<Id>());
export const loadActiveCenterReviewsSuccess = createAction('[Center] Load Active Center Reviews Success', props<Res<CenterReviews[]>>());
export const loadActiveCenterReviewsFailure = createAction('[Center] Load Active Center Reviews Failure', props<Err>());

export const addCenterReview = createAction('[Center] Add Center Review', props<Data>());
export const addCenterReviewSuccess = createAction('[Center] Add Center Review Success', props<Res<CenterReviews>>());
export const addCenterReviewFailure = createAction('[Center] Add Center Review Failure', props<Err>());

export const updateCenterReview = createAction('[Center] Update Center Review', props<Data>());
export const updateCenterReviewSuccess = createAction('[Center] Update Center Review Success', props<Res<CenterReviews>>());
export const updateCenterReviewFailure = createAction('[Center] Update Center Review Failure', props<Err>());

export const updateCenterReviewStatus = createAction('[Center] Update Center Review Status', props<Id>());
export const updateCenterReviewStatusSuccess = createAction('[Center] Update Center Review Status Success', props<Res<CenterReviews>>());
export const updateCenterReviewStatusFailure = createAction('[Center] Update Center Review Status Failure', props<Err>());

export const disableCenterReview = createAction('[Center] Disable Center Review', props<Id>());
export const disableCenterReviewSuccess = createAction('[Center] Disable Center Review Success', props<Res<CenterReviews>>());
export const disableCenterReviewFailure = createAction('[Center] Disable Center Review Failure', props<Err>());

export const deleteCenterReview = createAction('[Center] Delete Center Review', props<Id>());
export const deleteCenterReviewSuccess = createAction('[Center] Delete Center Review Success', props<Id>());
export const deleteCenterReviewFailure = createAction('[Center] Delete Center Review Failure', props<Err>());

// REFRESH (WebSocket)
export const refreshCenter = createAction('[Center] Refresh Center');
export const refreshCenters = createAction('[Centers] Refresh Centers');