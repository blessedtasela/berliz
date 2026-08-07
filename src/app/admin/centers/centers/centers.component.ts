import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { loadCenters } from 'src/app/state/center/center.actions';
import { selectCenters } from 'src/app/state/center/center.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
  selector: 'app-centers',
  templateUrl: './centers.component.html',
  styleUrls: ['./centers.component.css']
})
export class CentersComponent {
  centersData: Centers[] = [];
  totalCenters: number = 0;
  centersLength: number = 0;
  searchComponent: string = 'center';
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];

  readonly selectCenters = selectCenters;
  readonly centerSearchFields: AdminSearchField<Centers>[] = [
    { value: 'name', label: 'Name', accessor: c => c.name },
    { value: 'motto', label: 'Motto', accessor: c => c.motto },
    { value: 'address', label: 'Address', accessor: c => c.address },
    { value: 'id', label: 'Center id', accessor: c => c.id?.toString() },
    { value: 'partnerId', label: 'Partner id', accessor: c => c.partnerId?.toString() },
  ];

  constructor(private ngxService: NgxUiLoaderService,
    public store: Store) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => (subscription.unsubscribe()));
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadCenters());
    this.subscriptions.push(
      this.store.select(selectCenters).subscribe((allCenters) => {
        this.centersData = allCenters;
        this.totalCenters = allCenters.length
        this.centersLength = allCenters.length
        this.ngxService.stop()
      }),
    );
  }

  handleSearchResults(results: Centers[]): void {
    this.centersData = results;
    this.totalCenters = results.length;
  }

  emitData() {
    this.handleEmitEvent();
  }
}
