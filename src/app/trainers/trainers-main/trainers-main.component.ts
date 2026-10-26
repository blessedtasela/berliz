import { Component, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Trainers } from 'src/app/models/trainers.interface';
import { selectCurrentTrainer, selectActiveTrainers } from 'src/app/state/trainer/trainer.selector';
import { loadActiveTrainers, loadActiveTrainersFailure, loadActiveTrainersSuccess } from 'src/app/state/trainer/trainer.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { watchFirstLoad } from 'src/app/utils/first-load';

@Component({
    selector: 'app-trainers-main',
    templateUrl: './trainers-main.component.html',
    styleUrls: ['./trainers-main.component.css'],
    standalone: false
})
export class TrainersMainComponent implements OnDestroy {
  trainers: Trainers[] = [];

  /** True once the first load has finished (never on the server): a skeleton shows until then instead of "coming soon". */
  firstLoaded = false;
  private firstLoadSub?: Subscription;
  private platformId = inject(PLATFORM_ID);

  countResult: number = 0;
  allTrainers: Trainers[] = [];
  showPartnerForm = false;

  /** Why the trainers couldn't be loaded -- so a failed load never reads as "no trainers found". */
  loadError: string | null = null;
  private loadErrorSub?: Subscription;

  constructor(private store: Store, private actions$: Actions) { }

  retryLoad(): void {
    this.store.dispatch(loadActiveTrainers());
  }

  ngOnDestroy(): void {
    this.loadErrorSub?.unsubscribe();
    this.firstLoadSub?.unsubscribe();
  }

  ngOnInit(): void {
    this.loadErrorSub = watchLoadError(this.actions$, loadActiveTrainersFailure, [loadActiveTrainers, loadActiveTrainersSuccess], null, m => this.loadError = m);
    this.firstLoadSub = watchFirstLoad(this.actions$, this.platformId, [loadActiveTrainersSuccess, loadActiveTrainersFailure], () => this.firstLoaded = true);
    this.store.dispatch(loadActiveTrainers());
    this.store.select(selectActiveTrainers).subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.trainers = cachedData;
      }
    });
  }

  handleEmitEvent() {
    this.store.select(selectActiveTrainers).subscribe((cachedData) => {
      this.trainers = cachedData;
    });
  }

  handleSearchResults(results: Trainers[]): void {
    this.trainers = results;
    this.countResult = results.length;
  }

}
