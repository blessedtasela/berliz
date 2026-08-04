import { createReducer, on } from '@ngrx/store';
import * as A from './center.actions';
import { initialCenterState } from './center.state';

export const centerFeatureKey = 'center';

function upsert<T extends { id?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [...list, item];
}

export const centerReducer = createReducer(
  initialCenterState,

  // ── LOADING ───────────────────────────────────────────────────────────────
  on(
    A.loadCenters, A.loadActiveCenters, A.loadCenter, A.loadCenterByUserId,
    A.addCenter, A.updateCenter, A.updateCenterPhoto, A.updateCenterStatus,
    A.likeCenter, A.deleteCenter, A.loadCenterLikes, A.updateMyCenterTrainers,
    A.loadAllCenterAnnouncements, A.loadMyCenterAnnouncements, A.loadActiveCenterAnnouncements,
    A.addCenterAnnouncement, A.updateCenterAnnouncement, A.updateCenterAnnouncementStatus, A.deleteCenterAnnouncement,
    A.loadAllCenterEquipment, A.loadMyCenterEquipment,
    A.addCenterEquipment, A.updateCenterEquipment, A.deleteCenterEquipment,
    A.loadAllCenterIntroductions, A.loadMyCenterIntroductions,
    A.addCenterIntroduction, A.updateCenterIntroduction, A.deleteCenterIntroduction,
    A.loadAllCenterLocations, A.loadMyCenterLocations,
    A.addCenterLocation, A.updateCenterLocation, A.deleteCenterLocation,
    A.loadAllCenterPhotoAlbums, A.loadMyCenterPhotoAlbums,
    A.addCenterPhotoAlbum, A.updateCenterPhotoAlbum, A.deleteCenterPhotoAlbum,
    A.loadAllCenterPricing, A.loadMyCenterPricing,
    A.addCenterPricing, A.updateCenterPricing, A.deleteCenterPricing,
    A.loadAllCenterTrainers, A.loadMyCenterTrainers,
    A.addCenterTrainer, A.updateCenterTrainerStatus, A.deleteCenterTrainer,
    A.loadAllCenterVideoAlbums, A.loadMyCenterVideoAlbums,
    A.addCenterVideoAlbum, A.updateCenterVideoAlbum, A.deleteCenterVideoAlbum,
    A.loadAllCenterReviews, A.loadMyCenterReviews, A.loadActiveCenterReviews,
    A.addCenterReview, A.updateCenterReview, A.updateCenterReviewStatus,
    A.disableCenterReview, A.deleteCenterReview,
    state => ({ ...state, loading: true, error: null })
  ),

  // ── ALL FAILURES ──────────────────────────────────────────────────────────
  on(
    A.loadCentersFailure, A.loadActiveCentersFailure, A.loadCenterFailure, A.loadCenterByUserIdFailure,
    A.addCenterFailure, A.updateCenterFailure, A.updateCenterPhotoFailure, A.updateCenterStatusFailure,
    A.likeCenterFailure, A.deleteCenterFailure, A.loadCenterLikesFailure, A.updateMyCenterTrainersFailure,
    A.loadAllCenterAnnouncementsFailure, A.loadMyCenterAnnouncementsFailure, A.loadActiveCenterAnnouncementsFailure,
    A.addCenterAnnouncementFailure, A.updateCenterAnnouncementFailure, A.updateCenterAnnouncementStatusFailure, A.deleteCenterAnnouncementFailure,
    A.loadAllCenterEquipmentFailure, A.loadMyCenterEquipmentFailure,
    A.addCenterEquipmentFailure, A.updateCenterEquipmentFailure, A.deleteCenterEquipmentFailure,
    A.loadAllCenterIntroductionsFailure, A.loadMyCenterIntroductionsFailure,
    A.addCenterIntroductionFailure, A.updateCenterIntroductionFailure, A.deleteCenterIntroductionFailure,
    A.loadAllCenterLocationsFailure, A.loadMyCenterLocationsFailure,
    A.addCenterLocationFailure, A.updateCenterLocationFailure, A.deleteCenterLocationFailure,
    A.loadAllCenterPhotoAlbumsFailure, A.loadMyCenterPhotoAlbumsFailure,
    A.addCenterPhotoAlbumFailure, A.updateCenterPhotoAlbumFailure, A.deleteCenterPhotoAlbumFailure,
    A.loadAllCenterPricingFailure, A.loadMyCenterPricingFailure,
    A.addCenterPricingFailure, A.updateCenterPricingFailure, A.deleteCenterPricingFailure,
    A.loadAllCenterTrainersFailure, A.loadMyCenterTrainersFailure,
    A.addCenterTrainerFailure, A.updateCenterTrainerStatusFailure, A.deleteCenterTrainerFailure,
    A.loadAllCenterVideoAlbumsFailure, A.loadMyCenterVideoAlbumsFailure,
    A.addCenterVideoAlbumFailure, A.updateCenterVideoAlbumFailure, A.deleteCenterVideoAlbumFailure,
    A.loadAllCenterReviewsFailure, A.loadMyCenterReviewsFailure, A.loadActiveCenterReviewsFailure,
    A.addCenterReviewFailure, A.updateCenterReviewFailure, A.updateCenterReviewStatusFailure,
    A.disableCenterReviewFailure, A.deleteCenterReviewFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  // =========================================================================
  // CENTER CRUD
  // =========================================================================
  on(A.loadCentersSuccess, (s, { response }) => ({ ...s, loading: false, centers: response.data ?? [] })),
  on(A.loadActiveCentersSuccess, (s, { response }) => ({ ...s, loading: false, activeCenters: response.data ?? [] })),
  on(A.loadCenterSuccess, (s, { response }) => ({ ...s, loading: false, currentCenter: response.data ?? null })),
  on(A.loadCenterByUserIdSuccess, (s, { response }) => ({ ...s, loading: false, currentCenter: response.data ?? null })),

  on(A.addCenterSuccess, (s, { response }) => ({
    ...s, loading: false,
    currentCenter: response.data ?? s.currentCenter,
    centers: response.data ? [...s.centers, response.data] : s.centers,
  })),
  on(A.updateCenterSuccess, A.updateCenterPhotoSuccess, A.updateCenterStatusSuccess, A.likeCenterSuccess,
    (s, { response }) => ({
      ...s, loading: false,
      currentCenter: response.data ?? s.currentCenter,
      centers: response.data ? upsert(s.centers, response.data) : s.centers,
      activeCenters: response.data ? upsert(s.activeCenters, response.data) : s.activeCenters,
    })
  ),
  on(A.deleteCenterSuccess, (s, { id }) => ({
    ...s, loading: false,
    currentCenter: s.currentCenter?.id === id ? null : s.currentCenter,
    centers: s.centers.filter(c => c.id !== id),
    activeCenters: s.activeCenters.filter(c => c.id !== id),
  })),
  on(A.loadCenterLikesSuccess, (s, { response }) => ({ ...s, loading: false, centerLikes: response.data ?? [] })),
  on(A.updateMyCenterTrainersSuccess, (s) => ({ ...s, loading: false })),

  // =========================================================================
  // ANNOUNCEMENTS
  // =========================================================================
  on(A.loadAllCenterAnnouncementsSuccess, (s, { response }) => ({ ...s, loading: false, centerAnnouncements: response.data ?? [] })),
  on(A.loadMyCenterAnnouncementsSuccess, (s, { response }) => ({ ...s, loading: false, myCenterAnnouncements: response.data ?? [] })),
  on(A.loadActiveCenterAnnouncementsSuccess, (s, { response }) => ({ ...s, loading: false, activeCenterAnnouncements: response.data ?? [] })),

  on(A.addCenterAnnouncementSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterAnnouncements: response.data ? [...s.myCenterAnnouncements, response.data] : s.myCenterAnnouncements,
    centerAnnouncements: response.data ? [...s.centerAnnouncements, response.data] : s.centerAnnouncements,
  })),
  on(A.updateCenterAnnouncementSuccess, A.updateCenterAnnouncementStatusSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterAnnouncements: response.data ? upsert(s.myCenterAnnouncements, response.data) : s.myCenterAnnouncements,
    centerAnnouncements: response.data ? upsert(s.centerAnnouncements, response.data) : s.centerAnnouncements,
    activeCenterAnnouncements: response.data ? upsert(s.activeCenterAnnouncements, response.data) : s.activeCenterAnnouncements,
  })),
  on(A.deleteCenterAnnouncementSuccess, (s, { id }) => ({
    ...s, loading: false,
    myCenterAnnouncements: s.myCenterAnnouncements.filter(a => a.id !== id),
    centerAnnouncements: s.centerAnnouncements.filter(a => a.id !== id),
    activeCenterAnnouncements: s.activeCenterAnnouncements.filter(a => a.id !== id),
  })),

  // =========================================================================
  // EQUIPMENT
  // =========================================================================
  on(A.loadAllCenterEquipmentSuccess, (s, { response }) => ({ ...s, loading: false, centerEquipment: response.data ?? [] })),
  on(A.loadMyCenterEquipmentSuccess, (s, { response }) => ({ ...s, loading: false, myCenterEquipment: response.data ?? [] })),

  on(A.addCenterEquipmentSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterEquipment: response.data ? [...s.myCenterEquipment, response.data] : s.myCenterEquipment,
    centerEquipment: response.data ? [...s.centerEquipment, response.data] : s.centerEquipment,
  })),
  on(A.updateCenterEquipmentSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterEquipment: response.data ? upsert(s.myCenterEquipment, response.data) : s.myCenterEquipment,
    centerEquipment: response.data ? upsert(s.centerEquipment, response.data) : s.centerEquipment,
  })),
  on(A.deleteCenterEquipmentSuccess, (s, { id }) => ({
    ...s, loading: false,
    myCenterEquipment: s.myCenterEquipment.filter(e => e.id !== id),
    centerEquipment: s.centerEquipment.filter(e => e.id !== id),
  })),

  // =========================================================================
  // INTRODUCTIONS
  // =========================================================================
  on(A.loadAllCenterIntroductionsSuccess, (s, { response }) => ({ ...s, loading: false, centerIntroductions: response.data ?? [] })),
  on(A.loadMyCenterIntroductionsSuccess, (s, { response }) => ({ ...s, loading: false, myCenterIntroductions: response.data ?? [] })),

  on(A.addCenterIntroductionSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterIntroductions: response.data ? [...s.myCenterIntroductions, response.data] : s.myCenterIntroductions,
    centerIntroductions: response.data ? [...s.centerIntroductions, response.data] : s.centerIntroductions,
  })),
  on(A.updateCenterIntroductionSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterIntroductions: response.data ? upsert(s.myCenterIntroductions, response.data) : s.myCenterIntroductions,
    centerIntroductions: response.data ? upsert(s.centerIntroductions, response.data) : s.centerIntroductions,
  })),
  on(A.deleteCenterIntroductionSuccess, (s, { id }) => ({
    ...s, loading: false,
    myCenterIntroductions: s.myCenterIntroductions.filter(i => i.id !== id),
    centerIntroductions: s.centerIntroductions.filter(i => i.id !== id),
  })),

  // =========================================================================
  // LOCATIONS
  // =========================================================================
  on(A.loadAllCenterLocationsSuccess, (s, { response }) => ({ ...s, loading: false, centerLocations: response.data ?? [] })),
  on(A.loadMyCenterLocationsSuccess, (s, { response }) => ({ ...s, loading: false, myCenterLocations: response.data ?? [] })),

  on(A.addCenterLocationSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterLocations: response.data ? [...s.myCenterLocations, response.data] : s.myCenterLocations,
    centerLocations: response.data ? [...s.centerLocations, response.data] : s.centerLocations,
  })),
  on(A.updateCenterLocationSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterLocations: response.data ? upsert(s.myCenterLocations, response.data) : s.myCenterLocations,
    centerLocations: response.data ? upsert(s.centerLocations, response.data) : s.centerLocations,
  })),
  on(A.deleteCenterLocationSuccess, (s, { id }) => ({
    ...s, loading: false,
    myCenterLocations: s.myCenterLocations.filter(l => l.id !== id),
    centerLocations: s.centerLocations.filter(l => l.id !== id),
  })),

  // =========================================================================
  // PHOTO ALBUMS
  // =========================================================================
  on(A.loadAllCenterPhotoAlbumsSuccess, (s, { response }) => ({ ...s, loading: false, centerPhotoAlbums: response.data ?? [] })),
  on(A.loadMyCenterPhotoAlbumsSuccess, (s, { response }) => ({ ...s, loading: false, myCenterPhotoAlbums: response.data ?? [] })),

  on(A.addCenterPhotoAlbumSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterPhotoAlbums: response.data ? [...s.myCenterPhotoAlbums, response.data] : s.myCenterPhotoAlbums,
    centerPhotoAlbums: response.data ? [...s.centerPhotoAlbums, response.data] : s.centerPhotoAlbums,
  })),
  on(A.updateCenterPhotoAlbumSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterPhotoAlbums: response.data ? upsert(s.myCenterPhotoAlbums, response.data) : s.myCenterPhotoAlbums,
    centerPhotoAlbums: response.data ? upsert(s.centerPhotoAlbums, response.data) : s.centerPhotoAlbums,
  })),
  on(A.deleteCenterPhotoAlbumSuccess, (s, { id }) => ({
    ...s, loading: false,
    myCenterPhotoAlbums: s.myCenterPhotoAlbums.filter(p => p.id !== id),
    centerPhotoAlbums: s.centerPhotoAlbums.filter(p => p.id !== id),
  })),

  // =========================================================================
  // PRICING
  // =========================================================================
  on(A.loadAllCenterPricingSuccess, (s, { response }) => ({ ...s, loading: false, centerPricing: response.data ?? [] })),
  on(A.loadMyCenterPricingSuccess, (s, { response }) => ({ ...s, loading: false, myCenterPricing: response.data ?? null })),

  on(A.addCenterPricingSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterPricing: response.data ?? s.myCenterPricing,
    centerPricing: response.data ? [...s.centerPricing, response.data] : s.centerPricing,
  })),
  on(A.updateCenterPricingSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterPricing: response.data ?? s.myCenterPricing,
    centerPricing: response.data ? upsert(s.centerPricing, response.data) : s.centerPricing,
  })),
  on(A.deleteCenterPricingSuccess, (s, { id }) => ({
    ...s, loading: false,
    myCenterPricing: s.myCenterPricing?.id === id ? null : s.myCenterPricing,
    centerPricing: s.centerPricing.filter(p => p.id !== id),
  })),

  // =========================================================================
  // CENTER TRAINERS
  // =========================================================================
  on(A.loadAllCenterTrainersSuccess, (s, { response }) => ({ ...s, loading: false, centerTrainers: response.data ?? [] })),
  on(A.loadMyCenterTrainersSuccess, (s, { response }) => ({ ...s, loading: false, myCenterTrainers: response.data ?? [] })),

  on(A.addCenterTrainerSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterTrainers: response.data ? [...s.myCenterTrainers, response.data] : s.myCenterTrainers,
    centerTrainers: response.data ? [...s.centerTrainers, response.data] : s.centerTrainers,
  })),
  on(A.updateCenterTrainerStatusSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterTrainers: response.data ? upsert(s.myCenterTrainers, response.data) : s.myCenterTrainers,
    centerTrainers: response.data ? upsert(s.centerTrainers, response.data) : s.centerTrainers,
  })),
  on(A.deleteCenterTrainerSuccess, (s, { id }) => ({
    ...s, loading: false,
    myCenterTrainers: s.myCenterTrainers.filter(t => t.id !== id),
    centerTrainers: s.centerTrainers.filter(t => t.id !== id),
  })),

  // =========================================================================
  // VIDEO ALBUMS
  // =========================================================================
  on(A.loadAllCenterVideoAlbumsSuccess, (s, { response }) => ({ ...s, loading: false, centerVideoAlbums: response.data ?? [] })),
  on(A.loadMyCenterVideoAlbumsSuccess, (s, { response }) => ({ ...s, loading: false, myCenterVideoAlbums: response.data ?? [] })),

  on(A.addCenterVideoAlbumSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterVideoAlbums: response.data ? [...s.myCenterVideoAlbums, response.data] : s.myCenterVideoAlbums,
    centerVideoAlbums: response.data ? [...s.centerVideoAlbums, response.data] : s.centerVideoAlbums,
  })),
  on(A.updateCenterVideoAlbumSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterVideoAlbums: response.data ? upsert(s.myCenterVideoAlbums, response.data) : s.myCenterVideoAlbums,
    centerVideoAlbums: response.data ? upsert(s.centerVideoAlbums, response.data) : s.centerVideoAlbums,
  })),
  on(A.deleteCenterVideoAlbumSuccess, (s, { id }) => ({
    ...s, loading: false,
    myCenterVideoAlbums: s.myCenterVideoAlbums.filter(v => v.id !== id),
    centerVideoAlbums: s.centerVideoAlbums.filter(v => v.id !== id),
  })),

  // =========================================================================
  // REVIEWS
  // =========================================================================
  on(A.loadAllCenterReviewsSuccess, (s, { response }) => ({ ...s, loading: false, centerReviews: response.data ?? [] })),
  on(A.loadMyCenterReviewsSuccess, (s, { response }) => ({ ...s, loading: false, myCenterReviews: response.data ?? [] })),
  on(A.loadActiveCenterReviewsSuccess, (s, { response }) => ({ ...s, loading: false, activeCenterReviews: response.data ?? [] })),

  on(A.addCenterReviewSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterReviews: response.data ? [...s.myCenterReviews, response.data] : s.myCenterReviews,
    centerReviews: response.data ? [...s.centerReviews, response.data] : s.centerReviews,
  })),
  on(A.updateCenterReviewSuccess, A.updateCenterReviewStatusSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterReviews: response.data ? upsert(s.myCenterReviews, response.data) : s.myCenterReviews,
    centerReviews: response.data ? upsert(s.centerReviews, response.data) : s.centerReviews,
    activeCenterReviews: response.data ? upsert(s.activeCenterReviews, response.data) : s.activeCenterReviews,
  })),
  on(A.disableCenterReviewSuccess, (s, { response }) => ({
    ...s, loading: false,
    myCenterReviews: response.data ? upsert(s.myCenterReviews, response.data) : s.myCenterReviews,
    centerReviews: response.data ? upsert(s.centerReviews, response.data) : s.centerReviews,
    activeCenterReviews: response.data
      ? s.activeCenterReviews.filter(r => r.id !== response.data!.id)
      : s.activeCenterReviews,
  })),
  on(A.deleteCenterReviewSuccess, (s, { id }) => ({
    ...s, loading: false,
    myCenterReviews: s.myCenterReviews.filter(r => r.id !== id),
    centerReviews: s.centerReviews.filter(r => r.id !== id),
    activeCenterReviews: s.activeCenterReviews.filter(r => r.id !== id),
  })),

  // =========================================================================
  // STOMP REFRESH — re-triggers loadCenter$ in effects
  // =========================================================================
  on(A.refreshCenter, state => ({ ...state, loading: true })),

  // =========================================================================
  // STOMP REFRESH — re-triggers loadCenters$, loadActiveCenters$ in effects
  // =========================================================================
  on(A.refreshCenters, state => ({ ...state, loading: true })),
);