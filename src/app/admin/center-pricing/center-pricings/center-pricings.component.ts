import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CenterPricing } from 'src/app/models/centers.interface';
import { selectCenterPricing } from 'src/app/state/center/center.selectors';
import { loadAllCenterPricing } from 'src/app/state/center/center.actions';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
  selector: 'app-center-pricings',
  templateUrl: './center-pricings.component.html',
  styleUrls: ['./center-pricings.component.css']
})
export class CenterPricingsComponent {
  centerPricingData: CenterPricing[] = [];
  totalCenterPricing: number = 0;
  centerPricingLength: number = 0;

  readonly selectCenterPricing = selectCenterPricing;
  readonly centerPricingSearchFields: AdminSearchField<CenterPricing>[] = [
    { value: 'center', label: 'Center', accessor: c => c.centerName },
    { value: 'id', label: 'Pricing id', accessor: c => c.id?.toString() },
  ];

  constructor(private ngxService: NgxUiLoaderService,
    public store: Store) {
  }

  ngOnInit(): void {
    this.store.dispatch(loadAllCenterPricing());
    this.store.select(selectCenterPricing).subscribe((cachedData) => {
      this.centerPricingData = cachedData;
      this.totalCenterPricing = cachedData.length;
      this.centerPricingLength = cachedData.length;
    });
  }

  handleEmitEvent() {
    this.store.select(selectCenterPricing).subscribe((centerPricing) => {
      this.centerPricingData = centerPricing;
      this.totalCenterPricing = centerPricing.length;
      this.centerPricingLength = centerPricing.length;
    });
  }

  handleSearchResults(results: CenterPricing[]): void {
    this.centerPricingData = results;
    this.totalCenterPricing = results.length;
  }
}
