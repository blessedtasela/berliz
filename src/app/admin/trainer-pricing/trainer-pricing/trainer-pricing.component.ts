import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { TrainerPricing } from 'src/app/models/trainers.interface';
import { selectTrainerPricing } from 'src/app/state/trainer/trainer.selector';

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
    public store: Store) {
  }

  ngOnInit(): void {
    this.store.select(selectTrainerPricing).subscribe((cachedData) => {
      this.trainerPricingData = cachedData;
      this.totalTrainerPricing = cachedData.length
      this.trainerPricingLength = cachedData.length
    });
  }



  handleEmitEvent() {
    this.store.select(selectTrainerPricing).subscribe((trainerPricing) => {
      this.trainerPricingData = trainerPricing;
      this.totalTrainerPricing = trainerPricing.length
      this.trainerPricingLength = trainerPricing.length
    });
  }

  handleSearchResults(results: TrainerPricing[]): void {
    this.trainerPricingData = results;
    this.totalTrainerPricing = results.length;
  }

}
