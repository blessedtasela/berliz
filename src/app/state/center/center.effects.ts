import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { CenterService } from '../../services/center.service';
import * as A from './center.actions';

@Injectable()
export class CenterEffects {

    constructor(
        private actions$: Actions,
        private svc: CenterService,
    ) { }

    // =========================================================================
    // CENTER CRUD
    // =========================================================================
    loadCenters$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadCenters, A.refreshCenters),
        mergeMap(() => this.svc.getAllCenters().pipe(
            map(r => A.loadCentersSuccess({ response: r })),
            catchError(e => of(A.loadCentersFailure({ error: e?.error?.message || 'Failed to load centers' })))
        ))
    ));

    loadActiveCenters$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadActiveCenters, A.refreshCenters),
        mergeMap(() => this.svc.getActiveCenters().pipe(
            map(r => A.loadActiveCentersSuccess({ response: r })),
            catchError(e => of(A.loadActiveCentersFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    loadCenter$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadCenter, A.refreshCenters),
        mergeMap(() => this.svc.getCenter().pipe(
            map(r => A.loadCenterSuccess({ response: r })),
            catchError(e => of(A.loadCenterFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    loadCenterByUserId$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadCenterByUserId),
        mergeMap(({ userId }) => this.svc.getCenterByUserId(userId).pipe(
            map(r => A.loadCenterByUserIdSuccess({ response: r })),
            catchError(e => of(A.loadCenterByUserIdFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    addCenter$ = createEffect(() => this.actions$.pipe(
        ofType(A.addCenter),
        mergeMap(({ data }) => this.svc.addCenter(data).pipe(
            map(r => A.addCenterSuccess({ response: r })),
            catchError(e => of(A.addCenterFailure({ error: e?.error?.message || 'Failed to add center' })))
        ))
    ));

    updateCenter$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateCenter),
        mergeMap(({ data }) => this.svc.updateCenter(data).pipe(
            map(r => A.updateCenterSuccess({ response: r })),
            catchError(e => of(A.updateCenterFailure({ error: e?.error?.message || 'Failed to update center' })))
        ))
    ));

    updateCenterPhoto$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateCenterPhoto),
        mergeMap(({ data }) => this.svc.updateCenterPhoto(data).pipe(
            map(r => A.updateCenterPhotoSuccess({ response: r })),
            catchError(e => of(A.updateCenterPhotoFailure({ error: e?.error?.message || 'Failed to update photo' })))
        ))
    ));

    updateCenterStatus$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateCenterStatus),
        mergeMap(({ id }) => this.svc.updateCenterStatus(id).pipe(
            map(r => A.updateCenterStatusSuccess({ response: r })),
            catchError(e => of(A.updateCenterStatusFailure({ error: e?.error?.message || 'Failed to update status' })))
        ))
    ));

    likeCenter$ = createEffect(() => this.actions$.pipe(
        ofType(A.likeCenter),
        mergeMap(({ id }) => this.svc.likeCenter(id).pipe(
            map(r => A.likeCenterSuccess({ response: r })),
            catchError(e => of(A.likeCenterFailure({ error: e?.error?.message || 'Failed to like center' })))
        ))
    ));

    deleteCenter$ = createEffect(() => this.actions$.pipe(
        ofType(A.deleteCenter),
        mergeMap(({ id }) => this.svc.deleteCenter(id).pipe(
            map(() => A.deleteCenterSuccess({ id })),
            catchError(e => of(A.deleteCenterFailure({ error: e?.error?.message || 'Failed to delete center' })))
        ))
    ));

    loadCenterLikes$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadCenterLikes),
        mergeMap(() => this.svc.getCenterLikes().pipe(
            map(r => A.loadCenterLikesSuccess({ response: r })),
            catchError(e => of(A.loadCenterLikesFailure({ error: e?.error?.message || 'Failed to load likes' })))
        ))
    ));

    updateMyCenterTrainers$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateMyCenterTrainers),
        mergeMap(({ data }) => this.svc.updateMyCenterTrainers(data).pipe(
            map(r => A.updateMyCenterTrainersSuccess({ response: r })),
            catchError(e => of(A.updateMyCenterTrainersFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    // =========================================================================
    // ANNOUNCEMENTS
    // =========================================================================
    loadAllCenterAnnouncements$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadAllCenterAnnouncements),
        mergeMap(() => this.svc.getAllAnnouncements().pipe(
            map(r => A.loadAllCenterAnnouncementsSuccess({ response: r })),
            catchError(e => of(A.loadAllCenterAnnouncementsFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    loadMyCenterAnnouncements$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadMyCenterAnnouncements),
        mergeMap(() => this.svc.getMyAnnouncements().pipe(
            map(r => A.loadMyCenterAnnouncementsSuccess({ response: r })),
            catchError(e => of(A.loadMyCenterAnnouncementsFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    loadActiveCenterAnnouncements$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadActiveCenterAnnouncements),
        mergeMap(({ id }) => this.svc.getActiveAnnouncements(id).pipe(
            map(r => A.loadActiveCenterAnnouncementsSuccess({ response: r })),
            catchError(e => of(A.loadActiveCenterAnnouncementsFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    addCenterAnnouncement$ = createEffect(() => this.actions$.pipe(
        ofType(A.addCenterAnnouncement),
        mergeMap(({ data }) => this.svc.addAnnouncement(data).pipe(
            map(r => A.addCenterAnnouncementSuccess({ response: r })),
            catchError(e => of(A.addCenterAnnouncementFailure({ error: e?.error?.message || 'Failed to add announcement' })))
        ))
    ));

    updateCenterAnnouncement$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateCenterAnnouncement),
        mergeMap(({ data }) => this.svc.updateAnnouncement(data).pipe(
            map(r => A.updateCenterAnnouncementSuccess({ response: r })),
            catchError(e => of(A.updateCenterAnnouncementFailure({ error: e?.error?.message || 'Failed to update announcement' })))
        ))
    ));

    updateCenterAnnouncementStatus$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateCenterAnnouncementStatus),
        mergeMap(({ id }) => this.svc.updateAnnouncementStatus(id).pipe(
            map(r => A.updateCenterAnnouncementStatusSuccess({ response: r })),
            catchError(e => of(A.updateCenterAnnouncementStatusFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    deleteCenterAnnouncement$ = createEffect(() => this.actions$.pipe(
        ofType(A.deleteCenterAnnouncement),
        mergeMap(({ id }) => this.svc.deleteAnnouncement(id).pipe(
            map(() => A.deleteCenterAnnouncementSuccess({ id })),
            catchError(e => of(A.deleteCenterAnnouncementFailure({ error: e?.error?.message || 'Failed to delete announcement' })))
        ))
    ));

    // =========================================================================
    // EQUIPMENT
    // =========================================================================
    loadAllCenterEquipment$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadAllCenterEquipment),
        mergeMap(() => this.svc.getAllEquipment().pipe(
            map(r => A.loadAllCenterEquipmentSuccess({ response: r })),
            catchError(e => of(A.loadAllCenterEquipmentFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    loadMyCenterEquipment$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadMyCenterEquipment),
        mergeMap(() => this.svc.getMyEquipment().pipe(
            map(r => A.loadMyCenterEquipmentSuccess({ response: r })),
            catchError(e => of(A.loadMyCenterEquipmentFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    addCenterEquipment$ = createEffect(() => this.actions$.pipe(
        ofType(A.addCenterEquipment),
        mergeMap(({ data }) => this.svc.addEquipment(data).pipe(
            map(r => A.addCenterEquipmentSuccess({ response: r })),
            catchError(e => of(A.addCenterEquipmentFailure({ error: e?.error?.message || 'Failed to add equipment' })))
        ))
    ));

    updateCenterEquipment$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateCenterEquipment),
        mergeMap(({ data }) => this.svc.updateEquipment(data).pipe(
            map(r => A.updateCenterEquipmentSuccess({ response: r })),
            catchError(e => of(A.updateCenterEquipmentFailure({ error: e?.error?.message || 'Failed to update equipment' })))
        ))
    ));

    deleteCenterEquipment$ = createEffect(() => this.actions$.pipe(
        ofType(A.deleteCenterEquipment),
        mergeMap(({ id }) => this.svc.deleteEquipment(id).pipe(
            map(() => A.deleteCenterEquipmentSuccess({ id })),
            catchError(e => of(A.deleteCenterEquipmentFailure({ error: e?.error?.message || 'Failed to delete equipment' })))
        ))
    ));

    // =========================================================================
    // INTRODUCTIONS
    // =========================================================================
    loadAllCenterIntroductions$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadAllCenterIntroductions),
        mergeMap(() => this.svc.getAllIntroductions().pipe(
            map(r => A.loadAllCenterIntroductionsSuccess({ response: r })),
            catchError(e => of(A.loadAllCenterIntroductionsFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    loadMyCenterIntroductions$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadMyCenterIntroductions),
        mergeMap(() => this.svc.getMyIntroductions().pipe(
            map(r => A.loadMyCenterIntroductionsSuccess({ response: r })),
            catchError(e => of(A.loadMyCenterIntroductionsFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    addCenterIntroduction$ = createEffect(() => this.actions$.pipe(
        ofType(A.addCenterIntroduction),
        mergeMap(({ data }) => this.svc.addIntroduction(data).pipe(
            map(r => A.addCenterIntroductionSuccess({ response: r })),
            catchError(e => of(A.addCenterIntroductionFailure({ error: e?.error?.message || 'Failed to add introduction' })))
        ))
    ));

    updateCenterIntroduction$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateCenterIntroduction),
        mergeMap(({ data }) => this.svc.updateIntroduction(data).pipe(
            map(r => A.updateCenterIntroductionSuccess({ response: r })),
            catchError(e => of(A.updateCenterIntroductionFailure({ error: e?.error?.message || 'Failed to update introduction' })))
        ))
    ));

    deleteCenterIntroduction$ = createEffect(() => this.actions$.pipe(
        ofType(A.deleteCenterIntroduction),
        mergeMap(({ id }) => this.svc.deleteIntroduction(id).pipe(
            map(() => A.deleteCenterIntroductionSuccess({ id })),
            catchError(e => of(A.deleteCenterIntroductionFailure({ error: e?.error?.message || 'Failed to delete introduction' })))
        ))
    ));

    // =========================================================================
    // LOCATIONS
    // =========================================================================
    loadAllCenterLocations$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadAllCenterLocations),
        mergeMap(() => this.svc.getAllLocations().pipe(
            map(r => A.loadAllCenterLocationsSuccess({ response: r })),
            catchError(e => of(A.loadAllCenterLocationsFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    loadMyCenterLocations$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadMyCenterLocations),
        mergeMap(() => this.svc.getMyLocations().pipe(
            map(r => A.loadMyCenterLocationsSuccess({ response: r })),
            catchError(e => of(A.loadMyCenterLocationsFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    addCenterLocation$ = createEffect(() => this.actions$.pipe(
        ofType(A.addCenterLocation),
        mergeMap(({ data }) => this.svc.addLocation(data).pipe(
            map(r => A.addCenterLocationSuccess({ response: r })),
            catchError(e => of(A.addCenterLocationFailure({ error: e?.error?.message || 'Failed to add location' })))
        ))
    ));

    updateCenterLocation$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateCenterLocation),
        mergeMap(({ data }) => this.svc.updateLocation(data).pipe(
            map(r => A.updateCenterLocationSuccess({ response: r })),
            catchError(e => of(A.updateCenterLocationFailure({ error: e?.error?.message || 'Failed to update location' })))
        ))
    ));

    deleteCenterLocation$ = createEffect(() => this.actions$.pipe(
        ofType(A.deleteCenterLocation),
        mergeMap(({ id }) => this.svc.deleteLocation(id).pipe(
            map(() => A.deleteCenterLocationSuccess({ id })),
            catchError(e => of(A.deleteCenterLocationFailure({ error: e?.error?.message || 'Failed to delete location' })))
        ))
    ));

    // =========================================================================
    // PHOTO ALBUMS
    // =========================================================================
    loadAllCenterPhotoAlbums$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadAllCenterPhotoAlbums),
        mergeMap(() => this.svc.getAllPhotoAlbums().pipe(
            map(r => A.loadAllCenterPhotoAlbumsSuccess({ response: r })),
            catchError(e => of(A.loadAllCenterPhotoAlbumsFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    loadMyCenterPhotoAlbums$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadMyCenterPhotoAlbums),
        mergeMap(() => this.svc.getMyPhotoAlbums().pipe(
            map(r => A.loadMyCenterPhotoAlbumsSuccess({ response: r })),
            catchError(e => of(A.loadMyCenterPhotoAlbumsFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    addCenterPhotoAlbum$ = createEffect(() => this.actions$.pipe(
        ofType(A.addCenterPhotoAlbum),
        mergeMap(({ data }) => this.svc.addPhotoAlbum(data).pipe(
            map(r => A.addCenterPhotoAlbumSuccess({ response: r })),
            catchError(e => of(A.addCenterPhotoAlbumFailure({ error: e?.error?.message || 'Failed to add photo album' })))
        ))
    ));

    updateCenterPhotoAlbum$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateCenterPhotoAlbum),
        mergeMap(({ data }) => this.svc.updatePhotoAlbum(data).pipe(
            map(r => A.updateCenterPhotoAlbumSuccess({ response: r })),
            catchError(e => of(A.updateCenterPhotoAlbumFailure({ error: e?.error?.message || 'Failed to update photo album' })))
        ))
    ));

    deleteCenterPhotoAlbum$ = createEffect(() => this.actions$.pipe(
        ofType(A.deleteCenterPhotoAlbum),
        mergeMap(({ id }) => this.svc.deletePhotoAlbum(id).pipe(
            map(() => A.deleteCenterPhotoAlbumSuccess({ id })),
            catchError(e => of(A.deleteCenterPhotoAlbumFailure({ error: e?.error?.message || 'Failed to delete photo album' })))
        ))
    ));

    // =========================================================================
    // PRICING
    // =========================================================================
    loadAllCenterPricing$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadAllCenterPricing),
        mergeMap(() => this.svc.getAllPricing().pipe(
            map(r => A.loadAllCenterPricingSuccess({ response: r })),
            catchError(e => of(A.loadAllCenterPricingFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    loadMyCenterPricing$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadMyCenterPricing),
        mergeMap(() => this.svc.getMyPricing().pipe(
            map(r => A.loadMyCenterPricingSuccess({ response: r })),
            catchError(e => of(A.loadMyCenterPricingFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    addCenterPricing$ = createEffect(() => this.actions$.pipe(
        ofType(A.addCenterPricing),
        mergeMap(({ data }) => this.svc.addPricing(data).pipe(
            map(r => A.addCenterPricingSuccess({ response: r })),
            catchError(e => of(A.addCenterPricingFailure({ error: e?.error?.message || 'Failed to add pricing' })))
        ))
    ));

    updateCenterPricing$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateCenterPricing),
        mergeMap(({ data }) => this.svc.updatePricing(data).pipe(
            map(r => A.updateCenterPricingSuccess({ response: r })),
            catchError(e => of(A.updateCenterPricingFailure({ error: e?.error?.message || 'Failed to update pricing' })))
        ))
    ));

    deleteCenterPricing$ = createEffect(() => this.actions$.pipe(
        ofType(A.deleteCenterPricing),
        mergeMap(({ id }) => this.svc.deletePricing(id).pipe(
            map(() => A.deleteCenterPricingSuccess({ id })),
            catchError(e => of(A.deleteCenterPricingFailure({ error: e?.error?.message || 'Failed to delete pricing' })))
        ))
    ));

    // =========================================================================
    // CENTER TRAINERS
    // =========================================================================
    loadAllCenterTrainers$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadAllCenterTrainers),
        mergeMap(() => this.svc.getAllCenterTrainers().pipe(
            map(r => A.loadAllCenterTrainersSuccess({ response: r })),
            catchError(e => of(A.loadAllCenterTrainersFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    loadMyCenterTrainers$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadMyCenterTrainers),
        mergeMap(() => this.svc.getMyCenterTrainers().pipe(
            map(r => A.loadMyCenterTrainersSuccess({ response: r })),
            catchError(e => of(A.loadMyCenterTrainersFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    addCenterTrainer$ = createEffect(() => this.actions$.pipe(
        ofType(A.addCenterTrainer),
        mergeMap(({ data }) => this.svc.addCenterTrainer(data).pipe(
            map(r => A.addCenterTrainerSuccess({ response: r })),
            catchError(e => of(A.addCenterTrainerFailure({ error: e?.error?.message || 'Failed to add trainer' })))
        ))
    ));

    updateCenterTrainerStatus$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateCenterTrainerStatus),
        mergeMap(({ id }) => this.svc.updateCenterTrainerStatus(id).pipe(
            map(r => A.updateCenterTrainerStatusSuccess({ response: r })),
            catchError(e => of(A.updateCenterTrainerStatusFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    deleteCenterTrainer$ = createEffect(() => this.actions$.pipe(
        ofType(A.deleteCenterTrainer),
        mergeMap(({ id }) => this.svc.deleteCenterTrainer(id).pipe(
            map(() => A.deleteCenterTrainerSuccess({ id })),
            catchError(e => of(A.deleteCenterTrainerFailure({ error: e?.error?.message || 'Failed to delete trainer' })))
        ))
    ));

    // =========================================================================
    // VIDEO ALBUMS
    // =========================================================================
    loadAllCenterVideoAlbums$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadAllCenterVideoAlbums),
        mergeMap(() => this.svc.getAllVideoAlbums().pipe(
            map(r => A.loadAllCenterVideoAlbumsSuccess({ response: r })),
            catchError(e => of(A.loadAllCenterVideoAlbumsFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    loadMyCenterVideoAlbums$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadMyCenterVideoAlbums),
        mergeMap(() => this.svc.getMyVideoAlbums().pipe(
            map(r => A.loadMyCenterVideoAlbumsSuccess({ response: r })),
            catchError(e => of(A.loadMyCenterVideoAlbumsFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    addCenterVideoAlbum$ = createEffect(() => this.actions$.pipe(
        ofType(A.addCenterVideoAlbum),
        mergeMap(({ data }) => this.svc.addVideoAlbum(data).pipe(
            map(r => A.addCenterVideoAlbumSuccess({ response: r })),
            catchError(e => of(A.addCenterVideoAlbumFailure({ error: e?.error?.message || 'Failed to add video album' })))
        ))
    ));

    updateCenterVideoAlbum$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateCenterVideoAlbum),
        mergeMap(({ data }) => this.svc.updateVideoAlbum(data).pipe(
            map(r => A.updateCenterVideoAlbumSuccess({ response: r })),
            catchError(e => of(A.updateCenterVideoAlbumFailure({ error: e?.error?.message || 'Failed to update video album' })))
        ))
    ));

    deleteCenterVideoAlbum$ = createEffect(() => this.actions$.pipe(
        ofType(A.deleteCenterVideoAlbum),
        mergeMap(({ id }) => this.svc.deleteVideoAlbum(id).pipe(
            map(() => A.deleteCenterVideoAlbumSuccess({ id })),
            catchError(e => of(A.deleteCenterVideoAlbumFailure({ error: e?.error?.message || 'Failed to delete video album' })))
        ))
    ));

    // =========================================================================
    // REVIEWS
    // =========================================================================
    loadAllCenterReviews$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadAllCenterReviews),
        mergeMap(() => this.svc.getAllReviews().pipe(
            map(r => A.loadAllCenterReviewsSuccess({ response: r })),
            catchError(e => of(A.loadAllCenterReviewsFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    loadMyCenterReviews$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadMyCenterReviews),
        mergeMap(() => this.svc.getMyReviews().pipe(
            map(r => A.loadMyCenterReviewsSuccess({ response: r })),
            catchError(e => of(A.loadMyCenterReviewsFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    loadActiveCenterReviews$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadActiveCenterReviews),
        mergeMap(({ id }) => this.svc.getActiveReviews(id).pipe(
            map(r => A.loadActiveCenterReviewsSuccess({ response: r })),
            catchError(e => of(A.loadActiveCenterReviewsFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    addCenterReview$ = createEffect(() => this.actions$.pipe(
        ofType(A.addCenterReview),
        mergeMap(({ data }) => this.svc.addReview(data).pipe(
            map(r => A.addCenterReviewSuccess({ response: r })),
            catchError(e => of(A.addCenterReviewFailure({ error: e?.error?.message || 'Failed to add review' })))
        ))
    ));

    updateCenterReview$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateCenterReview),
        mergeMap(({ data }) => this.svc.updateReview(data).pipe(
            map(r => A.updateCenterReviewSuccess({ response: r })),
            catchError(e => of(A.updateCenterReviewFailure({ error: e?.error?.message || 'Failed to update review' })))
        ))
    ));

    updateCenterReviewStatus$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateCenterReviewStatus),
        mergeMap(({ id }) => this.svc.updateReviewStatus(id).pipe(
            map(r => A.updateCenterReviewStatusSuccess({ response: r })),
            catchError(e => of(A.updateCenterReviewStatusFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    disableCenterReview$ = createEffect(() => this.actions$.pipe(
        ofType(A.disableCenterReview),
        mergeMap(({ id }) => this.svc.disableReview(id).pipe(
            map(r => A.disableCenterReviewSuccess({ response: r })),
            catchError(e => of(A.disableCenterReviewFailure({ error: e?.error?.message || 'Failed to disable review' })))
        ))
    ));

    deleteCenterReview$ = createEffect(() => this.actions$.pipe(
        ofType(A.deleteCenterReview),
        mergeMap(({ id }) => this.svc.deleteReview(id).pipe(
            map(() => A.deleteCenterReviewSuccess({ id })),
            catchError(e => of(A.deleteCenterReviewFailure({ error: e?.error?.message || 'Failed to delete review' })))
        ))
    ));
}