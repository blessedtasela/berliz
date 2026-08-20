import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, catchError, forkJoin, of } from 'rxjs';
import {
  TrainerBenefits,
  TrainerFeatureVideo,
  TrainerIntroduction,
  TrainerPhotoAlbum,
  TrainerPricing,
  TrainerVideoAlbum,
  Trainers,
  TrainerSubscription
} from 'src/app/models/trainers.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { MyTrainerSubModalComponent } from '../my-trainer-sub-modal/my-trainer-sub-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { selectCurrentTrainer, selectMyTrainerBenefit, selectMyTrainerFeatureVideos, selectMyTrainerIntroduction, selectMyTrainerPhotoAlbum, selectMyTrainerPricing, selectMyTrainerSubscription, selectMyTrainerVideoAlbum } from 'src/app/state/trainer/trainer.selector';
import { loadMyTrainer, loadMyTrainerPricing, loadMyTrainerIntroduction, loadMyTrainerBenefits, loadMyTrainerFeatureVideos, loadMyTrainerPhotoAlbum, loadMyTrainerVideoAlbum, loadMyTrainerSubscription } from 'src/app/state/trainer/trainer.actions';

// Which sections are completed — used to build the checklist
export interface ProfileCompletion {
  introduction: boolean;
  pricing: boolean;
  benefits: boolean;
  featureVideos: boolean;
  photoAlbum: boolean;
  videoAlbum: boolean;
}

@Component({
  selector: 'app-my-trainer-main',
  templateUrl: './my-trainer-main.component.html',
  styleUrls: ['./my-trainer-main.component.css']
})
export class MyTrainerMainComponent implements OnInit, OnDestroy {

  trainerIntroduction!: TrainerIntroduction | null;
  trainerPricing!: TrainerPricing | null;
  trainerBenefit!: TrainerBenefits | null;
  trainerFeatureVideo: TrainerFeatureVideo[] = [];
  trainerPhotoAlbum!: TrainerPhotoAlbum | null;
  trainerVideoAlbum!: TrainerVideoAlbum | null;
  trainerSubscription!: TrainerSubscription | null;
  trainer!: Trainers | null;

  dataReady = false;

  private totalRequests = 8;
  // Tracks which of the 8 sections has resolved at least once, keyed by name
  // (see markRequestCompleted). A Set instead of a running counter because the
  // selector subscriptions below are now set up exactly ONCE (see ngOnInit) —
  // with a counter, calling loadData() again (e.g. from a websocket event)
  // while old subscriptions were still alive used to keep incrementing past
  // totalRequests every time the store emitted, which happened to still work
  // by accident but relied on subscriptions leaking forever.
  private completedKeys = new Set<string>();

  // Computed after data loads
  profileCompletion: ProfileCompletion = {
    introduction: false,
    pricing: false,
    benefits: false,
    featureVideos: false,
    photoAlbum: false,
    videoAlbum: false,
  };

  subscriptions: Subscription[] = [];

  constructor(
    private ngxService: NgxUiLoaderService,
    private rxStompService: RxStompService,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.handleWatchService();
    // Store subscriptions are wired up once, here — loadData() below (and
    // every subsequent call to it, e.g. from websocket events or the
    // subscription modal) only dispatches. Previously each of the 8
    // loadX() methods called store.select(...).subscribe(...) itself, so
    // every loadData() call (including one per websocket topic message)
    // created 8 brand-new, never-unsubscribed store subscriptions on top
    // of whatever was already listening — a growing subscription leak that
    // also meant a single store emission could re-run markRequestCompleted
    // once per leaked subscription.
    this.watchStoreState();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // ── Store subscriptions (set up once) ───────────────────────────────────────

  private watchStoreState(): void {
    this.subscriptions.push(
      this.store.select(selectCurrentTrainer).subscribe(res => {
        this.trainer = res;
        this.markRequestCompleted('trainer');
      }),
      this.store.select(selectMyTrainerPricing).subscribe(res => {
        this.trainerPricing = res;
        this.markRequestCompleted('pricing');
      }),
      this.store.select(selectMyTrainerIntroduction).subscribe(res => {
        this.trainerIntroduction = res;
        this.markRequestCompleted('introduction');
      }),
      this.store.select(selectMyTrainerBenefit).subscribe(res => {
        this.trainerBenefit = res;
        this.markRequestCompleted('benefits');
      }),
      this.store.select(selectMyTrainerFeatureVideos).subscribe(res => {
        this.trainerFeatureVideo = res;
        this.markRequestCompleted('featureVideos');
      }),
      this.store.select(selectMyTrainerPhotoAlbum).subscribe(res => {
        this.trainerPhotoAlbum = res;
        this.markRequestCompleted('photoAlbum');
      }),
      this.store.select(selectMyTrainerVideoAlbum).subscribe(res => {
        this.trainerVideoAlbum = res;
        this.markRequestCompleted('videoAlbum');
      }),
      this.store.select(selectMyTrainerSubscription).subscribe(res => {
        this.trainerSubscription = res;
        this.markRequestCompleted('subscription');
      }),
    );
  }

  private markRequestCompleted(key: string): void {
    this.completedKeys.add(key);

    if (this.completedKeys.size >= this.totalRequests) {
      this.computeProfileCompletion();
      this.dataReady = true;
      this.cdr.detectChanges();
    }
  }

  private computeProfileCompletion(): void {
    this.profileCompletion = {
      introduction: !!this.trainerIntroduction?.id,
      pricing: !!this.trainerPricing?.id,
      benefits: (this.trainerBenefit?.benefits?.length ?? 0) >= 5,
      featureVideos: (this.trainerFeatureVideo?.length ?? 0) >= 2,
      photoAlbum: !!this.trainerPhotoAlbum?.id,
      videoAlbum: !!this.trainerVideoAlbum?.id,
    };
  }

  // ── Load data (dispatch only) ────────────────────────────────────────────────
  // Safe to call repeatedly (initial load, websocket-triggered refresh, modal
  // save) without leaking subscriptions or piling up duplicate HTTP requests:
  // the loadMyTrainer*/loadMyTrainerSubscription effects use exhaustMap, which
  // collapses concurrent/duplicate dispatches of the same action into a single
  // in-flight request.

  loadData(): void {
    this.store.dispatch(loadMyTrainer());
    this.store.dispatch(loadMyTrainerIntroduction());
    this.store.dispatch(loadMyTrainerPricing());
    this.store.dispatch(loadMyTrainerBenefits());
    this.store.dispatch(loadMyTrainerFeatureVideos());
    this.store.dispatch(loadMyTrainerPhotoAlbum());
    this.store.dispatch(loadMyTrainerVideoAlbum());
    this.store.dispatch(loadMyTrainerSubscription());
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  get isActive(): boolean {
    return this.trainer?.status === 'true';
  }

  get hasActiveSubscription(): boolean {
    if (!this.trainerSubscription) return false;
    return this.trainerSubscription.status?.toLowerCase() === 'active' &&
      new Date(this.trainerSubscription.endDate) > new Date();

  }

  get subscriptionExpired(): boolean {
    if (!this.trainerSubscription) return false;
    return new Date(this.trainerSubscription.endDate) <= new Date();
  }

  get completedSections(): number {
    return Object.values(this.profileCompletion).filter(Boolean).length;
  }

  get totalSections(): number {
    return Object.keys(this.profileCompletion).length;
  }

  get allSectionsComplete(): boolean {
    return this.completedSections === this.totalSections;
  }

  get progressPercent(): number {
    return Math.round((this.completedSections / this.totalSections) * 100);
  }


  private refreshCompletion(): void {
    this.computeProfileCompletion();
    this.cdr.detectChanges();
  }



  openSubscriptionModal(): void {
    const dialogRef = this.dialog.open(MyTrainerSubModalComponent, {
      width: '420px',
      maxWidth: '95vw',
      disableClose: true,
      autoFocus: false,
      panelClass: 'berliz-modal'
    });

    dialogRef.componentInstance.closeEvent.subscribe(() => {
      dialogRef.close();
    });

    dialogRef.componentInstance.savedEvent.subscribe(() => {
      dialogRef.close();
      this.loadData(); // refresh subscription + trainer status
    });
  }


  // ── WebSocket watch ───────────────────────────────────────────────────────

  handleWatchService(): void {
    const topics = [
      '/topic/trainerIntroduction',
      '/topic/trainerPricing',
      '/topic/trainerBenefit',
      '/topic/trainerFeatureVideo',
      '/topic/trainerPhotoAlbum',
      '/topic/trainerVideoAlbum',
      '/topic/trainerSubscription',
      '/topic/updateTrainerStatus',
      '/topic/activateTrainer',
    ];

    topics.forEach(topic => {
      const sub = this.rxStompService.watch(topic).subscribe(message => {
        if (!message?.body) return;
        this.loadData();
      });
      this.subscriptions.push(sub);
    });
  }

  private ignoreError<T>(defaultValue: T) {
    return catchError(() => of(defaultValue));
  }
}
