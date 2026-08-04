import { Injectable } from '@angular/core';
import { RxStompService } from './rx-stomp.service';
import { Store } from '@ngrx/store';
import { merge } from 'rxjs';

import { refreshUser }          from '../state/user/user.actions';
import { refreshNotifications } from '../state/notification/notification.actions';
import { refreshTrainer }       from '../state/trainer/trainer.actions';
import { refreshCenter }        from '../state/center/center.actions';

@Injectable({ providedIn: 'root' })
export class WebSocketService {

    // =========================================================================
    // USER TOPICS
    // =========================================================================
    private readonly userTopics = [
        '/topic/updateUser',
        '/topic/updateUserEmail',
        '/topic/updateUserBio',
        '/topic/updateProfilePhoto',
        '/topic/updateProfilePhotoAdmin',
        '/topic/updateStatus',
        '/topic/updateRole',
        '/topic/activateAccount',
        '/topic/deactivateAccount',
        '/topic/deleteUser',
        '/topic/forcePasswordChange',
        '/topic/resetPassword',
        '/topic/changePassword',
        '/topic/quickAddUser',
        '/topic/signupUser',
        '/topic/loginUser',
        '/topic/forgotPassword',
        '/topic/sendActivationToken',
    ];

    // =========================================================================
    // TRAINER TOPICS  —  match every notify() call in TrainerServiceImplement
    // =========================================================================
    private readonly trainerTopics = [
        // Trainer CRUD
        '/topic/addTrainer',
        '/topic/updateTrainer',
        '/topic/deleteTrainer',
        '/topic/updateTrainerStatus',
        '/topic/activateTrainer',
        '/topic/updateTrainerPhoto',
        '/topic/likeTrainer',

        // Pricing
        '/topic/addTrainerPricing',
        '/topic/updateTrainerPricing',
        '/topic/deleteTrainerPricing',

        // Benefits
        '/topic/addTrainerBenefit',
        '/topic/updateTrainerBenefit',
        '/topic/deleteTrainerBenefit',

        // Introduction
        '/topic/addTrainerIntroduction',
        '/topic/updateTrainerIntroduction',
        '/topic/deleteTrainerIntroduction',

        // Video Album
        '/topic/addTrainerVideosAlbum',
        '/topic/updateTrainerVideosAlbum',
        '/topic/deleteTrainerVideosAlbum',

        // Photo Album
        '/topic/addTrainerPhotosAlbum',
        '/topic/updateTrainerPhotosAlbum',
        '/topic/deleteTrainerPhotoAlbum',

        // Feature Videos
        '/topic/addTrainerFeatureVideo',
        '/topic/updateTrainerFeatureVideo',
        '/topic/deleteTrainerFeatureVideo',
        '/topic/updateFeatureVideoPosition',
        '/topic/setFeatureVideo',
        '/topic/incrementFeatureVideoViews',

        // Reviews
        '/topic/addTrainerReview',
        '/topic/updateTrainerReview',
        '/topic/updateTrainerReviewStatus',
        '/topic/deleteTrainerReview',
        '/topic/likeTrainerReview',
        '/topic/disableTrainerReview',

        // Subscriptions
        '/topic/addTrainerSubscription',
        '/topic/updateTrainerSubscription',
        '/topic/updateTrainerSubscriptionStatus',
        '/topic/deleteTrainerSubscription',
    ];

    // =========================================================================
    // CENTER TOPICS  —  match every notify() call in CenterServiceImplement
    // =========================================================================
    private readonly centerTopics = [
        // Center CRUD
        '/topic/addCenter',
        '/topic/updateCenter',
        '/topic/deleteCenter',
        '/topic/updateCenterStatus',
        '/topic/updateCenterPhoto',
        '/topic/likeCenter',
        '/topic/updateMyCenterTrainers',

        // Announcements
        '/topic/addCenterAnnouncement',
        '/topic/updateCenterAnnouncement',
        '/topic/updateCenterAnnouncementStatus',
        '/topic/deleteCenterAnnouncement',

        // Equipment
        '/topic/addCenterEquipment',
        '/topic/updateCenterEquipment',
        '/topic/deleteCenterEquipment',

        // Introduction
        '/topic/addCenterIntroduction',
        '/topic/updateCenterIntroduction',
        '/topic/deleteCenterIntroduction',

        // Locations
        '/topic/addCenterLocation',
        '/topic/updateCenterLocation',
        '/topic/deleteCenterLocation',

        // Photo Album
        '/topic/addCenterPhotoAlbum',
        '/topic/updateCenterPhotoAlbum',
        '/topic/deleteCenterPhotoAlbum',

        // Pricing
        '/topic/addCenterPricing',
        '/topic/updateCenterPricing',
        '/topic/deleteCenterPricing',

        // Center Trainers
        '/topic/addCenterTrainer',
        '/topic/updateCenterTrainerStatus',
        '/topic/deleteCenterTrainer',

        // Video Album
        '/topic/addCenterVideoAlbum',
        '/topic/updateCenterVideoAlbum',
        '/topic/deleteCenterVideoAlbum',

        // Reviews
        '/topic/addCenterReview',
        '/topic/updateCenterReview',
        '/topic/updateCenterReviewStatus',
        '/topic/disableCenterReview',
        '/topic/deleteCenterReview',
    ];

    // =========================================================================
    // NOTIFICATION TOPICS
    // =========================================================================
    private readonly notificationTopics = [
        '/topic/notification',
        '/topic/readNotification',
        '/topic/deleteNotification',
        '/topic/notificationBulkAction',
        '/topic/getNotificationFromMap',
    ];

    // =========================================================================
    // SUBSCRIPTION TOPICS  (platform-level, not trainer-specific)
    // =========================================================================
    private readonly subscriptionTopics = [
        '/topic/updateSubscription',
        '/topic/getSubscriptionFromMap',
        '/topic/updateSubscriptionStatus',
        '/topic/deleteSubscription',
        '/topic/subscriptionBulkAction',
    ];

    constructor(
        private rxStompService: RxStompService,
        private store:          Store,
    ) {
        this.initializeListeners();
    }

    // =========================================================================
    // INIT
    // =========================================================================
    private initializeListeners(): void {

        const allTopics = [
            ...this.userTopics,
            ...this.trainerTopics,
            ...this.centerTopics,
            ...this.notificationTopics,
            ...this.subscriptionTopics,
        ];

        merge(...allTopics.map(topic => this.rxStompService.watch(topic)))
            .subscribe(message => {
                const destination = message.headers?.['destination'];
                if (!destination) return;

                // ── User ──────────────────────────────────────────────────────
                if (this.userTopics.includes(destination)) {
                    this.store.dispatch(refreshUser());
                }

                // ── Trainer ───────────────────────────────────────────────────
                else if (this.trainerTopics.includes(destination)) {
                    this.store.dispatch(refreshTrainer());
                }

                // ── Center ────────────────────────────────────────────────────
                else if (this.centerTopics.includes(destination)) {
                    this.store.dispatch(refreshCenter());
                }

                // ── Notifications ─────────────────────────────────────────────
                else if (this.notificationTopics.includes(destination)) {
                    this.store.dispatch(refreshNotifications());
                }

                // ── Platform subscriptions ────────────────────────────────────
                // No dedicated refresh action needed — subscription changes
                // cascade into trainer/center state via their own topics.
            });
    }
}
