import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { TrainerPricing } from 'src/app/models/trainers.interface';
import { TrainerStateService } from 'src/app/services/trainer-state.service';

@Component({
  selector: 'app-trainer-pricing',
  templateUrl: './trainer-pricing.component.html',
  styleUrls: ['./trainer-pricing.component.css']
})
export class TrainerPricingComponent {
  trainerPricingData: TrainerPricing[] = [];
  totalTrainerPricing: number = 0;
  trainerPricingLength: number = 0;
  searchComponent: string = 'trainer-pricing'
  isSearch: boolean = true;

  constructor(private ngxService: NgxUiLoaderService,
    public trainerStateService: TrainerStateService) {
  }

  ngOnInit(): void {
    this.trainerStateService.allTrainerPricingData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.trainerPricingData = cachedData;
        this.totalTrainerPricing = cachedData.length
        this.trainerPricingLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.trainerStateService.getAllTrainerPricing().subscribe((trainerPricing) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.trainerPricingData = trainerPricing;
      this.totalTrainerPricing = trainerPricing.length
      this.trainerPricingLength = trainerPricing.length
      this.trainerStateService.setAllTrainerPricingSubject(this.trainerPricingData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: TrainerPricing[]): void {
    this.trainerPricingData = results;
    this.totalTrainerPricing = results.length;
  }

}
