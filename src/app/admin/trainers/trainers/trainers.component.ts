import { Actions } from '@ngrx/effects';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Trainers } from 'src/app/models/trainers.interface';
import { loadTrainers, loadTrainersFailure, loadTrainersSuccess } from 'src/app/state/trainer/trainer.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { selectTrainers } from 'src/app/state/trainer/trainer.selector';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
    selector: 'app-trainers',
    templateUrl: './trainers.component.html',
    styleUrls: ['./trainers.component.css'],
    standalone: false
})
export class TrainersComponent {
  trainersData: Trainers[] = [];
  totalTrainers: number = 0;
  trainersLength: number = 0;
  searchComponent: string = 'trainer'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];
  /** Why the list couldn't be loaded -- so a failed load never reads as an empty table. */
  loadError: string | null = null;

  readonly selectTrainers = selectTrainers;
  readonly trainerSearchFields: AdminSearchField<Trainers>[] = [
    { value: 'name', label: 'Name', accessor: t => t.name },
    { value: 'email', label: 'Email', accessor: t => t.userEmail },
    { value: 'motto', label: 'Motto', accessor: t => t.motto },
    { value: 'address', label: 'Address', accessor: t => t.address },
    { value: 'id', label: 'Trainer id', accessor: t => t.id?.toString() },
    { value: 'status', label: 'Status', accessor: t => t.status },
  ];

  constructor(public store: Store, private actions$: Actions) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.subscriptions.push(watchLoadError(this.actions$, loadTrainersFailure, [loadTrainers, loadTrainersSuccess], null, m => this.loadError = m));
    this.store.dispatch(loadTrainers());
    this.subscriptions.push(
      this.store.select(selectTrainers).subscribe((allTrainers) => {
        this.trainersData = allTrainers;
        this.totalTrainers = allTrainers.length
        this.trainersLength = allTrainers.length
      })
    );
  }

  handleSearchResults(results: Trainers[]): void {
    this.trainersData = results;
    this.totalTrainers = results.length;
  }


  retryLoad(): void {
    this.store.dispatch(loadTrainers());
  }
}
