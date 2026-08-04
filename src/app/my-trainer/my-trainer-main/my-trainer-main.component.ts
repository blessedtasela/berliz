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
  private completedRequests = 0;

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
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  private markRequestCompleted(): void {
    this.completedRequests++;

    if (this.completedRequests >= this.totalRequests) {
      this.computeProfileCompletion();
      this.dataReady = true;
      this.cdr.detectChanges();
    }
  }

  loadTrainer(): void {
    this.store.dispatch(loadMyTrainer());
    this.store.select(selectCurrentTrainer).subscribe({
      next: res => {
        this.trainer = res;
        this.markRequestCompleted();
      },
      error: err => {
        console.error(err);
        this.markRequestCompleted();
      }
    });
  }

  loadPricing(): void {
    this.store.dispatch(loadMyTrainerPricing());
    this.store.select(selectMyTrainerPricing).subscribe({
      next: res => {
        this.trainerPricing = res;
        this.markRequestCompleted();
      },
      error: err => {
        console.error(err);
        this.markRequestCompleted();
      }
    });
  }


  loadIntroduction(): void {
    this.store.dispatch(loadMyTrainerIntroduction());
    this.store.select(selectMyTrainerIntroduction).subscribe({
      next: res => {
        this.trainerIntroduction = res;
        console.log('Loaded introduction:', res);
        this.markRequestCompleted();
      },
      error: err => {
        console.error(err);
        this.markRequestCompleted();
      }
    });
  }

  loadBenefits(): void {
    this.store.dispatch(loadMyTrainerBenefits());
    this.store.select(selectMyTrainerBenefit).subscribe({
      next: res => {
        this.trainerBenefit = res;
        this.markRequestCompleted();
      },
      error: err => {
        console.error(err);
        this.markRequestCompleted();
      }
    });
  }

  loadFeatureVideos(): void {
    this.store.dispatch(loadMyTrainerFeatureVideos());
    this.store.select(selectMyTrainerFeatureVideos).subscribe({
      next: res => {
        this.trainerFeatureVideo = res;
        this.markRequestCompleted();
      },
      error: err => {
        console.error(err);
        this.markRequestCompleted();
      }
    });
  }


  loadPhotoAlbum(): void {
    this.store.dispatch(loadMyTrainerPhotoAlbum());
    this.store.select(selectMyTrainerPhotoAlbum).subscribe({
      next: res => {
        this.trainerPhotoAlbum = res;
        this.markRequestCompleted();
      },
      error: err => {
        console.error(err);
        this.markRequestCompleted();
      }
    });
  }

  loadVideoAlbum(): void {
    this.store.dispatch(loadMyTrainerVideoAlbum());
    this.store.select(selectMyTrainerVideoAlbum).subscribe({
      next: res => {
        this.trainerVideoAlbum = res;
        this.markRequestCompleted();
      },
      error: err => {
        console.error(err);
        this.markRequestCompleted();
      }
    });
  }

  loadSubscription(): void {
    this.store.dispatch(loadMyTrainerSubscription());
    this.store.select(selectMyTrainerSubscription).subscribe({
      next: res => {
        this.trainerSubscription = res;
        this.markRequestCompleted();
      },
      error: err => {
        console.error(err);
        this.markRequestCompleted();
      }
    });
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


  loadData(): void {

    this.dataReady = false;
    this.completedRequests = 0;

    this.loadTrainer();
    this.loadIntroduction();
    this.loadPricing();
    this.loadBenefits();
    this.loadFeatureVideos();
    this.loadPhotoAlbum();
    this.loadVideoAlbum();
    this.loadSubscription();
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