import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin, Subscription } from 'rxjs';
import {
  TrainerBenefits,
  TrainerFeatureVideo,
  TrainerIntroduction,
  TrainerPhotoAlbum,
  TrainerPricing,
  TrainerVideoAlbum
} from 'src/app/models/trainers.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';

@Component({
  selector: 'app-trainer-details',
  templateUrl: './trainer-details.component.html',
  styleUrls: ['./trainer-details.component.css']
})
export class TrainerDetailsComponent implements OnInit, OnDestroy {

  trainerIntroduction!: TrainerIntroduction;
  trainerPricing!: TrainerPricing;
  trainerBenefit!: TrainerBenefits;
  trainerFeatureVideo!: TrainerFeatureVideo[];
  trainerPhotoAlbum!: TrainerPhotoAlbum;
  trainerVideoAlbum!: TrainerVideoAlbum;

  // Controls *ngIf — only true once ALL data is loaded
  dataReady = false;

  subscriptions: Subscription[] = [];

  constructor(
    private ngxService: NgxUiLoaderService,
    private rxStompService: RxStompService,
    private trainerStateService: TrainerStateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.handleWatchService();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  loadData(): void {
    this.dataReady = false;
    this.ngxService.start();

    forkJoin({
      trainerIntroduction: this.trainerStateService.getMyTrainerIntroduction(),
      trainerPricing: this.trainerStateService.getMyTrainerPricing(),
      trainerBenefit: this.trainerStateService.getMyTrainerBenefits(),
      trainerFeatureVideo: this.trainerStateService.getMyTrainerFeatureVideos(),
      trainerPhotoAlbum: this.trainerStateService.getMyTrainerPhotoAlbum(),
      trainerVideoAlbum: this.trainerStateService.getMyTrainerVideoAlbum(),
    }).subscribe({
      next: ({
        trainerIntroduction,
        trainerPricing,
        trainerBenefit,
        trainerFeatureVideo,
        trainerPhotoAlbum,
        trainerVideoAlbum
      }) => {
        // ── Spread every object so Angular detects a new reference ──────────
        // Without spread, if the backend returns the same shape, Angular won't
        // see a change and ngOnChanges in children won't fire.
        this.trainerIntroduction = { ...trainerIntroduction };
        this.trainerPricing = { ...trainerPricing };
        this.trainerBenefit = { ...trainerBenefit };
        this.trainerFeatureVideo = [...trainerFeatureVideo];
        this.trainerVideoAlbum = { ...trainerVideoAlbum };

        // Photo album — spread AND spread the nested photoResponses array
        // so the child's ngOnChanges sees a truly new reference
        this.trainerPhotoAlbum = {
          ...trainerPhotoAlbum,
          photoResponses: trainerPhotoAlbum.photoResponses
            ? [...trainerPhotoAlbum.photoResponses]
            : []
        };

        // Only show children after all data is ready
        this.dataReady = true;
        this.ngxService.stop();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[TrainerDetails] loadData error:', err);
        this.ngxService.stop();
      }
    });
  }

  handleWatchService(): void {
    const topics = [
      '/topic/trainerIntroduction',
      '/topic/trainerPricing',
      '/topic/trainerBenefit',
      '/topic/trainerFeatureVideo',
      '/topic/trainerPhotoAlbum',
      '/topic/trainerVideoAlbum',
    ];

    topics.forEach(topic => {
      const sub = this.rxStompService.watch(topic).subscribe(message => {
        if (!message?.body) return; // skip empty/initial messages
        this.loadData();
      });
      this.subscriptions.push(sub);
    });
  }
}