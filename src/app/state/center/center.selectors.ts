import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CenterState } from './center.state';
import { centerFeatureKey } from './center.reducer';

const selectState = createFeatureSelector<CenterState>(centerFeatureKey);

// ── Async ─────────────────────────────────────────────────────────────────────
export const selectCenterLoading = createSelector(selectState, s => s.loading);
export const selectCenterError = createSelector(selectState, s => s.error);

// ── Centers ───────────────────────────────────────────────────────────────────
export const selectCenters = createSelector(selectState, s => s.centers);
export const selectActiveCenters = createSelector(selectState, s => s.activeCenters);
export const selectCurrentCenter = createSelector(selectState, s => s.currentCenter);

// ── Likes ─────────────────────────────────────────────────────────────────────
export const selectCenterLikes = createSelector(selectState, s => s.centerLikes);

// ── Announcements ─────────────────────────────────────────────────────────────
export const selectCenterAnnouncements = createSelector(selectState, s => s.centerAnnouncements);
export const selectMyCenterAnnouncements = createSelector(selectState, s => s.myCenterAnnouncements);
export const selectActiveCenterAnnouncements = createSelector(selectState, s => s.activeCenterAnnouncements);

// ── Equipment ─────────────────────────────────────────────────────────────────
export const selectCenterEquipment = createSelector(selectState, s => s.centerEquipment);
export const selectMyCenterEquipment = createSelector(selectState, s => s.myCenterEquipment);

// ── Introductions ─────────────────────────────────────────────────────────────
export const selectCenterIntroductions = createSelector(selectState, s => s.centerIntroductions);
export const selectMyCenterIntroductions = createSelector(selectState, s => s.myCenterIntroductions);

// ── Locations ─────────────────────────────────────────────────────────────────
export const selectCenterLocations = createSelector(selectState, s => s.centerLocations);
export const selectMyCenterLocations = createSelector(selectState, s => s.myCenterLocations);

// ── Photo Albums ──────────────────────────────────────────────────────────────
export const selectCenterPhotoAlbums = createSelector(selectState, s => s.centerPhotoAlbums);
export const selectMyCenterPhotoAlbums = createSelector(selectState, s => s.myCenterPhotoAlbums);

// ── Pricing ───────────────────────────────────────────────────────────────────
export const selectCenterPricing = createSelector(selectState, s => s.centerPricing);
export const selectMyCenterPricing = createSelector(selectState, s => s.myCenterPricing);

// ── Center Trainers ───────────────────────────────────────────────────────────
export const selectCenterTrainers = createSelector(selectState, s => s.centerTrainers);
export const selectMyCenterTrainers = createSelector(selectState, s => s.myCenterTrainers);

// ── Video Albums ──────────────────────────────────────────────────────────────
export const selectCenterVideoAlbums = createSelector(selectState, s => s.centerVideoAlbums);
export const selectMyCenterVideoAlbums = createSelector(selectState, s => s.myCenterVideoAlbums);

// ── Reviews ───────────────────────────────────────────────────────────────────
export const selectCenterReviews = createSelector(selectState, s => s.centerReviews);
export const selectMyCenterReviews = createSelector(selectState, s => s.myCenterReviews);
export const selectActiveCenterReviews = createSelector(selectState, s => s.activeCenterReviews);

// ── Derived ───────────────────────────────────────────────────────────────────
/** Total active center count — useful for dashboard badges */
export const selectActiveCenterCount = createSelector(
    selectActiveCenters,
    centers => centers.length
);

/** Whether the current user has a center profile */
export const selectHasCenter = createSelector(
    selectCurrentCenter,
    center => center !== null
);