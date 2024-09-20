import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin, Subscription } from 'rxjs';
import { TrainerBenefits, TrainerFeatureVideo, TrainerIntrodution, TrainerPricing } from 'src/app/models/trainers.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';

@Component({
  selector: 'app-trainer-details',
  templateUrl: './trainer-details.component.html',
  styleUrls: ['./trainer-details.component.css']
})
export class TrainerDetailsComponent implements OnInit {
  trainerIntroduction!: TrainerIntrodution;
  trainerPricing!: TrainerPricing;
  trainerBenefit!: TrainerBenefits;
  trainerFeatureVideo!: TrainerFeatureVideo;
  componentLoaded: boolean = false;
  subscriptions: Subscription[] = []

  constructor(private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private rxStompService: RxStompService,
    private trainerStateService: TrainerStateService,) { }

  ngOnInit() {
    this.ngxService.start()
    this.handleWatchService()
    this.loadData()
    this.ngxService.stop()
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleTrainerIntroductionEmit() {
    this.subscriptions.push(
      this.trainerStateService.getMyTrainerIntroduction().subscribe((trainerIntroduction) => {
        this.trainerIntroduction = trainerIntroduction;
      }));
  }

  handleTrainerPricingEmit() {
    this.subscriptions.push(
      this.trainerStateService.getMyTrainerPricing().subscribe((trainerPricing) => {
        this.trainerPricing = trainerPricing;
      }));
  }

  handleTrainerBenefitEmit() {
    this.subscriptions.push(
      this.trainerStateService.getMyTrainerBenefits().subscribe((trainerBenefit) => {
        this.trainerBenefit = trainerBenefit;
      }));
  }

  handleTrainerFeatureVideoEmit() {
    this.subscriptions.push(
      this.trainerStateService.getMyTrainerFeatureVideo().subscribe((trainerFeatureVideo) => {
        this.trainerFeatureVideo = trainerFeatureVideo;
      }));
  }

  handleEmitEvent() {
    this.handleTrainerIntroductionEmit();
    this.handleTrainerPricingEmit();
    this.handleTrainerBenefitEmit();
    this.handleTrainerFeatureVideoEmit();
  }

  handleDataInit() {
    this.trainerStateService.myTrainerIntroductionData$.subscribe(trainerIntroduction => {
      if (trainerIntroduction) {
        this.trainerIntroduction = trainerIntroduction;
      } else {
        this.handleTrainerIntroductionEmit();
      }
    })
    this.trainerStateService.myTrainerPricingData$.subscribe(trainerPricing => {
      if (trainerPricing) {
        this.trainerPricing = trainerPricing;
      } else {
        this.handleTrainerPricingEmit();
      }
    })
    this.trainerStateService.myTrainerBenefitData$.subscribe(trainerBenefits => {
      if (trainerBenefits) {
        this.trainerBenefit = trainerBenefits;
      } else {
        this.handleTrainerBenefitEmit();
      }
    })
    this.trainerStateService.myTrainerFeatureVideoData$.subscribe(trainerFeatureVideo => {
      if (trainerFeatureVideo) {
        this.trainerFeatureVideo = trainerFeatureVideo;
      } else {
        this.handleTrainerFeatureVideoEmit();
      }
    })
    this.componentLoaded = true;
  }

  loadData() {
    forkJoin({
      trainerIntroduction: this.trainerStateService.getMyTrainerIntroduction(),
      trainerPricing: this.trainerStateService.getMyTrainerPricing(),
      trainerBenefit: this.trainerStateService.getMyTrainerBenefits(),
      trainerFeatureVideo: this.trainerStateService.getMyTrainerFeatureVideo(),
    }).subscribe(
      ({ trainerIntroduction, trainerPricing, trainerBenefit, trainerFeatureVideo }) => {
        this.trainerIntroduction = trainerIntroduction;
        this.trainerPricing = trainerPricing;
        this.trainerBenefit = trainerBenefit;
        this.trainerFeatureVideo = trainerFeatureVideo;
        this.componentLoaded = true;
        this.ngxService.stop();
      },
      error => {
        console.error('Error loading data', error);
        this.ngxService.stop();
      }
    );
  }

  handleWatchService() {
    this.watchGetTrainerIntroductionFromMap();
    this.watchGetTrainerPricingFromMap();
    this.watchGetTrainerBenefitFromMap();
    this.watchGetTrainerFeatureVideoFromMap();
  }

  watchGetTrainerIntroductionFromMap() {
    this.rxStompService.watch('/topic/getTrainerIntroductionFromMap').subscribe((message) => {
      this.handleTrainerIntroductionEmit()
    });
  }

  watchGetTrainerPricingFromMap() {
    this.rxStompService.watch('/topic/getTrainerPricingFromMap').subscribe((message) => {
      this.handleTrainerPricingEmit()
    });
  }

  watchGetTrainerBenefitFromMap() {
    this.rxStompService.watch('/topic/getTrainerBenefitFromMap').subscribe((message) => {
      this.handleTrainerBenefitEmit()
    });
  }

  watchGetTrainerFeatureVideoFromMap() {
    this.rxStompService.watch('/topic/getTrainerFeatureVideoFromMap').subscribe((message) => {
      this.handleTrainerFeatureVideoEmit()
    });
  }
}