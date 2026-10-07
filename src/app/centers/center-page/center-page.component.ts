import { Component, OnInit } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { CenterCategory, Centers } from 'src/app/models/centers.interface';
import { selectActiveCenters } from 'src/app/state/center/center.selectors';
import { loadActiveCenters, loadActiveCentersFailure, loadActiveCentersSuccess } from 'src/app/state/center/center.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';

@Component({
    selector: 'app-center-page',
    templateUrl: './center-page.component.html',
    styleUrls: ['./center-page.component.css'],
    standalone: false
})

export class CenterPageComponent implements OnInit {
  centers: Centers[] = [];
  countResult: number = 0;
  allCenters: Centers[] = [];
  subscription: Subscription = new Subscription;
  /** Why the centers couldn't be loaded -- so a failed load never reads as "no centers found". */
  loadError: string | null = null;

  constructor(private store: Store,
    private actions$: Actions,
    private ngxService: NgxUiLoaderService) { }

  retryLoad(): void {
    this.store.dispatch(loadActiveCenters());
  }

  ngOnInit(): void {
    this.subscription.add(watchLoadError(this.actions$, loadActiveCentersFailure, [loadActiveCenters, loadActiveCentersSuccess], null, m => this.loadError = m));
    this.store.dispatch(loadActiveCenters());
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
