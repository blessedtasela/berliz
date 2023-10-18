import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { CenterStateService } from 'src/app/services/center-state.service';

@Component({
  selector: 'app-center',
  templateUrl: './center.component.html',
  styleUrls: ['./center.component.css']
})
export class CenterComponent {
  centersData: Centers[] = [];
  totalCenters: number = 0;
  centersLength: number = 0;
  searchComponent: string = 'center';
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];

  constructor(private ngxService: NgxUiLoaderService,
    public centerStateService: CenterStateService) {
  }

  ngOnInit(): void {
    this.centerStateService.allCentersData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.centersData = cachedData;
        this.totalCenters = cachedData.length
        this.centersLength = cachedData.length
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => (subscription.unsubscribe()));
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.subscriptions.push(
      this.centerStateService.getAllCenters().subscribe((allCenters) => {
        console.log('isCachedData false')
        this.centersData = allCenters;
        this.totalCenters = allCenters.length
        this.centersLength = allCenters.length
        this.centerStateService.setAllCentersSubject(this.centersData);
      }),
    );
    this.ngxService.stop()
  }

  handleSearchResults(results: Centers[]): void {
    this.centersData = results;
    this.totalCenters = results.length;
  }

  emitData(){
    this.handleEmitEvent();
  }
}


