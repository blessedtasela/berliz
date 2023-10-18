import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { CenterCategory, Centers } from 'src/app/models/centers.interface';
import { CenterStateService } from 'src/app/services/center-state.service';

@Component({
  selector: 'app-center-page',
  templateUrl: './center-page.component.html',
  styleUrls: ['./center-page.component.css']
})

export class CenterPageComponent implements OnInit {
  centers: Centers[] = [];
  countResult: number = 0;
  allCenters: Centers[] = [];
  subscription: Subscription = new Subscription;

  constructor(private centerStateService: CenterStateService,
    private ngxService: NgxUiLoaderService) { }

  ngOnInit(): void {
    this.centerStateService.activeCentersData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.centers = cachedData;
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  handleEmitEvent() {
    this.subscription.add(
      this.centerStateService.getActiveCenters().subscribe((activeCenters) => {
        console.log('isCachedData false')
        this.centers = activeCenters;
        this.centerStateService.setActiveCentersSubject(this.centers);
      })
    );
  }

  handleSearchResults(results: Centers[]): void {
    this.centers = results;
    this.countResult = results.length;
  }

}
