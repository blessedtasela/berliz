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
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { MyTrainerSubModalComponent } from '../my-trainer-sub-modal/my-trainer-sub-modal.component';
import { MatDialog } from '@angular/material/dialog';

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

  trainerIntroduction!: TrainerIntroduction;
  trainerPricing!: TrainerPricing;
  trainerBenefit!: TrainerBenefits;
  trainerFeatureVideo!: TrainerFeatureVideo[];
  trainerPhotoAlbum!: TrainerPhotoAlbum;
  trainerVideoAlbum!: TrainerVideoAlbum;
  trainerSubscription!: TrainerSubscription;
  trainer!: Trainers;

  dataReady = false;

  private totalRequests = 7;
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
    private trainerStateService: TrainerStateService,
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
    this.trainerStateService.getTrainer().subscribe({
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
    this.trainerStateService.getMyTrainerPricing().subscribe({
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
    this.trainerStateService.getMyTrainerIntroduction().subscribe({
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
    this.trainerStateService.getMyTrainerBenefits().subscribe({
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
    this.trainerStateService.getMyTrainerFeatureVideos().subscribe({
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
    this.trainerStateService.getMyTrainerPhotoAlbum().subscribe({
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
    this.trainerStateService.getMyTrainerVideoAlbum().subscribe({
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
    this.trainerStateService.getMyTrainerSubscription().subscribe({
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