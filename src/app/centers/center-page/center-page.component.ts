import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { CenterCategory, Centers } from 'src/app/models/centers.interface';
import { selectActiveCenters } from 'src/app/state/center/center.selectors';

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

  constructor(private store: Store,
    private ngxService: NgxUiLoaderService) { }

  ngOnInit(): void {
    this.store.select(selectActiveCenters).subscribe((cachedData) => {
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
      this.store.select(selectActiveCenters).subscribe((activeCenters) => {
        console.log('isCachedData false')
        this.centers = activeCenters;
      })
    );
  }

  handleSearchResults(results: Centers[]): void {
    this.centers = results;
    this.countResult = results.length;
  }

}
