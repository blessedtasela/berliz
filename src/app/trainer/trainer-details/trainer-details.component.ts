import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { TrainerIntrodution, TrainerPricing } from 'src/app/models/trainers.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';

@Component({
  selector: 'app-trainer-details',
  templateUrl: './trainer-details.component.html',
  styleUrls: ['./trainer-details.component.css']
})
export class TrainerDetailsComponent {
  trainerIntroduction!: TrainerIntrodution;
  trainerPricing!: TrainerPricing;
  subscriptions: Subscription[] = []

  constructor(private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private rxStompService: RxStompService,
    private trainerStateService: TrainerStateService,) { }

  ngOnInit() {
    this.ngxService.start()
    this.watchGetTrainerIntroductionFromMap()
    this.watchGetTrainerPricingFromMap()
    this.trainerStateService.myTrainerIntroductionData$.subscribe(trainerIntroduction => {
      if (trainerIntroduction) {
        this.trainerIntroduction = trainerIntroduction;
      } else {
        this.handleEmitEvent();
      }
    })
    this.trainerStateService.myTrainerPricingData$.subscribe(trainerPricing => {
      if (trainerPricing) {
        this.trainerPricing = trainerPricing;
      } else {
        this.handleEmitEvent();
      }
    })
    this.ngxService.stop()
  }

  ngAfterViewInit() { }

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

  handleEmitEvent() {
    this.handleTrainerIntroductionEmit()
    this.handleTrainerPricingEmit()
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

}
