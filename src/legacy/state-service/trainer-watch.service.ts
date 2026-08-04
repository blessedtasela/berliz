// import { Subject, Subscription } from 'rxjs';
// import { Injectable, OnDestroy } from '@angular/core';
// import { RxStompService } from 'src/app/services/rx-stomp.service';

// /**
//  * Singleton STOMP watch service for all trainer-related topics.
//  *
//  * USAGE IN COMPONENTS:
//  *   constructor(private watch: TrainerWatchService) {}
//  *   ngOnInit() {
//  *     this.watch.onUpdateTrainer$.subscribe(trainer => this.reload());
//  *     this.watch.onSubscriptionUpdated$.subscribe(sub => this.handleSubChange(sub));
//  *   }
//  *
//  * WHY A SERVICE (not component-local):
//  *   - One STOMP connection per topic regardless of how many components are alive
//  *   - Components subscribe/unsubscribe to in-memory Subject — no duplicate socket traffic
//  *   - Centralised topic string management — one place to fix a typo
//  */
// @Injectable({ providedIn: 'root' })

// export class TrainerWatchService implements OnDestroy {

//   // ── Trainer CRUD ──────────────────────────────────────────────────────────
//   readonly onAddTrainer$ = new Subject<any>();
//   readonly onUpdateTrainer$ = new Subject<any>();
//   readonly onDeleteTrainer$ = new Subject<any>();
//   readonly onUpdateTrainerStatus$ = new Subject<any>();
//   readonly onActivateTrainer$ = new Subject<any>();
//   readonly onUpdateTrainerPhoto$ = new Subject<any>();
//   readonly onLikeTrainer$ = new Subject<any>();

//   // ── Pricing ───────────────────────────────────────────────────────────────
//   readonly onAddTrainerPricing$ = new Subject<any>();
//   readonly onUpdateTrainerPricing$ = new Subject<any>();
//   readonly onDeleteTrainerPricing$ = new Subject<any>();

//   // ── Benefits ──────────────────────────────────────────────────────────────
//   readonly onAddTrainerBenefit$ = new Subject<any>();
//   readonly onUpdateTrainerBenefit$ = new Subject<any>();
//   readonly onDeleteTrainerBenefit$ = new Subject<any>();

//   // ── Introduction ──────────────────────────────────────────────────────────
//   readonly onAddTrainerIntroduction$ = new Subject<any>();
//   readonly onUpdateTrainerIntroduction$ = new Subject<any>();
//   readonly onDeleteTrainerIntroduction$ = new Subject<any>();

//   // ── Video Album ───────────────────────────────────────────────────────────
//   readonly onAddTrainerVideosAlbum$ = new Subject<any>();
//   readonly onUpdateTrainerVideosAlbum$ = new Subject<any>();
//   readonly onDeleteTrainerVideosAlbum$ = new Subject<any>(); // no notify in service but reserved

//   // ── Photo Album ───────────────────────────────────────────────────────────
//   readonly onAddTrainerPhotosAlbum$ = new Subject<any>();
//   readonly onUpdateTrainerPhotosAlbum$ = new Subject<any>();
//   readonly onDeleteTrainerPhotosAlbum$ = new Subject<any>();

//   // ── Feature Video ─────────────────────────────────────────────────────────
//   readonly onAddTrainerFeatureVideo$ = new Subject<any>();
//   readonly onUpdateTrainerFeatureVideo$ = new Subject<any>();
//   readonly onDeleteTrainerFeatureVideo$ = new Subject<any>();
//   readonly onUpdateFeatureVideoPosition$ = new Subject<any>(); // NOTE: backend missing leading slash — fixed here
//   readonly onSetFeaturedVideo$ = new Subject<any>(); // NOTE: backend missing leading slash — fixed here
//   readonly onIncrementFeatureVideoViews$ = new Subject<any>(); // NOTE: backend missing leading slash — fixed here

//   // ── Reviews ───────────────────────────────────────────────────────────────
//   readonly onAddTrainerReview$ = new Subject<any>();
//   readonly onUpdateTrainerReview$ = new Subject<any>();
//   readonly onUpdateTrainerReviewStatus$ = new Subject<any>();
//   readonly onDeleteTrainerReview$ = new Subject<any>();
//   readonly onLikeTrainerReview$ = new Subject<any>();
//   readonly onDisableTrainerReview$ = new Subject<any>(); // NOTE: backend missing leading slash — fixed here

//   // ── Subscriptions ─────────────────────────────────────────────────────────
//   readonly onAddTrainerSubscription$ = new Subject<any>();
//   readonly onUpdateTrainerSubscription$ = new Subject<any>();
//   readonly onUpdateTrainerSubscriptionStatus$ = new Subject<any>();
//   readonly onDeleteTrainerSubscription$ = new Subject<any>();

//   private subs: Subscription[] = [];

//   constructor(private stomp: RxStompService) {
//     this.connect();
//   }

//   private connect(): void {
//     const bind = (topic: string, subject: Subject<any>) => {
//       this.subs.push(
//         this.stomp.watch(topic).subscribe((msg: any) => {
//           try {
//             subject.next(JSON.parse(msg.body));
//           } catch {
//             subject.next(msg.body); // pass raw if not JSON
//           }
//         })
//       );
//     };

//     // ── Trainer CRUD ────────────────────────────────────────────────────────
//     bind('/topic/addTrainer', this.onAddTrainer$);
//     bind('/topic/updateTrainer', this.onUpdateTrainer$);
//     bind('/topic/deleteTrainer', this.onDeleteTrainer$);
//     bind('/topic/updateTrainerStatus', this.onUpdateTrainerStatus$);
//     bind('/topic/activateTrainer', this.onActivateTrainer$);
//     bind('/topic/updateTrainerPhoto', this.onUpdateTrainerPhoto$);
//     bind('/topic/likeTrainer', this.onLikeTrainer$);

//     // ── Pricing ─────────────────────────────────────────────────────────────
//     bind('/topic/addTrainerPricing', this.onAddTrainerPricing$);
//     bind('/topic/updateTrainerPricing', this.onUpdateTrainerPricing$);
//     bind('/topic/deleteTrainerPricing', this.onDeleteTrainerPricing$);

//     // ── Benefits ────────────────────────────────────────────────────────────
//     bind('/topic/addTrainerBenefit', this.onAddTrainerBenefit$);
//     bind('/topic/updateTrainerBenefit', this.onUpdateTrainerBenefit$);
//     bind('/topic/deleteTrainerBenefit', this.onDeleteTrainerBenefit$);

//     // ── Introduction ────────────────────────────────────────────────────────
//     bind('/topic/addTrainerIntroduction', this.onAddTrainerIntroduction$);
//     bind('/topic/updateTrainerIntroduction', this.onUpdateTrainerIntroduction$);
//     bind('/topic/deleteTrainerIntroduction', this.onDeleteTrainerIntroduction$);

//     // ── Video Album ─────────────────────────────────────────────────────────
//     bind('/topic/addTrainerVideosAlbum', this.onAddTrainerVideosAlbum$);
//     bind('/topic/updateTrainerVideosAlbum', this.onUpdateTrainerVideosAlbum$);

//     // ── Photo Album ─────────────────────────────────────────────────────────
//     bind('/topic/addTrainerPhotosAlbum', this.onAddTrainerPhotosAlbum$);
//     bind('/topic/updateTrainerPhotosAlbum', this.onUpdateTrainerPhotosAlbum$);
//     bind('/topic/deleteTrainerPhotoAlbum', this.onDeleteTrainerPhotosAlbum$);

//     // ── Feature Video ────────────────────────────────────────────────────────
//     bind('/topic/addTrainerFeatureVideo', this.onAddTrainerFeatureVideo$);
//     bind('/topic/updateTrainerFeatureVideo', this.onUpdateTrainerFeatureVideo$);
//     bind('/topic/deleteTrainerFeatureVideo', this.onDeleteTrainerFeatureVideo$);
//     bind('/topic/updateFeatureVideoPosition', this.onUpdateFeatureVideoPosition$);  // fixed slash
//     bind('/topic/setFeatureVideo', this.onSetFeaturedVideo$);             // fixed slash
//     bind('/topic/incrementFeatureVideoViews', this.onIncrementFeatureVideoViews$);  // fixed slash

//     // ── Reviews ─────────────────────────────────────────────────────────────
//     bind('/topic/addTrainerReview', this.onAddTrainerReview$);
//     bind('/topic/updateTrainerReview', this.onUpdateTrainerReview$);
//     bind('/topic/updateTrainerReviewStatus', this.onUpdateTrainerReviewStatus$);
//     bind('/topic/deleteTrainerReview', this.onDeleteTrainerReview$);
//     bind('/topic/likeTrainerReview', this.onLikeTrainerReview$);
//     bind('/topic/disableTrainerReview', this.onDisableTrainerReview$);          // fixed slash

//     // ── Subscriptions ────────────────────────────────────────────────────────
//     bind('/topic/addTrainerSubscription', this.onAddTrainerSubscription$);
//     bind('/topic/updateTrainerSubscription', this.onUpdateTrainerSubscription$);
//     bind('/topic/updateTrainerSubscriptionStatus', this.onUpdateTrainerSubscriptionStatus$);
//     bind('/topic/deleteTrainerSubscription', this.onDeleteTrainerSubscription$);
//   }

//   ngOnDestroy(): void {
//     this.subs.forEach(s => s.unsubscribe());
//   }
// }