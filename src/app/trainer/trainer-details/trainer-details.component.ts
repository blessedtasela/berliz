import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin, skip, Subscription } from 'rxjs';
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
export class TrainerDetailsComponent implements OnInit {

  trainerIntroduction!: TrainerIntroduction;
  trainerPricing!: TrainerPricing;
  trainerBenefit!: TrainerBenefits;
  trainerFeatureVideo!: TrainerFeatureVideo;
  trainerPhotoAlbum!: TrainerPhotoAlbum;
  trainerVideoAlbum!: TrainerVideoAlbum;

  subscriptions: Subscription[] = [];

  constructor(
    private ngxService: NgxUiLoaderService,
    private rxStompService: RxStompService,
    private trainerStateService: TrainerStateService
  ) {}

  ngOnInit() {
    this.handleWatchService();
    this.loadData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  loadData() {
  
    forkJoin({
      trainerIntroduction: this.trainerStateService.getMyTrainerIntroduction(),
      trainerPricing: this.trainerStateService.getMyTrainerPricing(),
      trainerBenefit: this.trainerStateService.getMyTrainerBenefits(),
      trainerFeatureVideo: this.trainerStateService.getMyTrainerFeatureVideo(),
      trainerPhotoAlbum: this.trainerStateService.getMyTrainerPhotoAlbum(),
      trainerVideoAlbum: this.trainerStateService.getMyTrainerVideoAlbum(),
    }).subscribe(
      ({
        trainerIntroduction,
        trainerPricing,
        trainerBenefit,
        trainerFeatureVideo,
        trainerPhotoAlbum,
        trainerVideoAlbum
      }) => {
        this.trainerIntroduction = trainerIntroduction;
        this.trainerPricing = trainerPricing;
        this.trainerBenefit = trainerBenefit;
        this.trainerFeatureVideo = trainerFeatureVideo;
        this.trainerPhotoAlbum = trainerPhotoAlbum;
        this.trainerVideoAlbum = trainerVideoAlbum;

      }
    );

  }

  handleWatchService() {
    const topics = [
      '/topic/getTrainerIntroductionFromMap',
      '/topic/getTrainerPricingFromMap',
      '/topic/getTrainerBenefitFromMap',
      '/topic/getTrainerFeatureVideoFromMap',
      '/topic/getTrainerPhotoAlbumFromMap',
      '/topic/getTrainerVideoAlbumFromMap'
    ];
  
    topics.forEach(topic => {
      const sub = this.rxStompService.watch(topic)
        .pipe(skip(1))  // ⬅️ ignore the initial empty message
        .subscribe(() => {
          this.loadData();
        });
  
      this.subscriptions.push(sub);
    });
  
  }
}