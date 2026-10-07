import { Actions } from '@ngrx/effects';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Exercises } from 'src/app/models/exercise.interface';
import { loadExercises, loadExercisesFailure, loadExercisesSuccess } from 'src/app/state/exercise/exercise.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { selectExercises } from 'src/app/state/exercise/exercise.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
    selector: 'app-exercises',
    templateUrl: './exercises.component.html',
    styleUrls: ['./exercises.component.css'],
    standalone: false
})
export class ExercisesComponent {
  exercisesData: Exercises[] = [];
  totalExercises: number = 0;
  exercisesLength: number = 0;
  searchComponent: string = 'exercise'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];
  /** Why the list couldn't be loaded -- so a failed load never reads as an empty table. */
  loadError: string | null = null;

  readonly selectExercises = selectExercises;
  readonly exerciseSearchFields: AdminSearchField<Exercises>[] = [
    { value: 'name', label: 'Name', accessor: e => e.name },
    { value: 'description', label: 'Description', accessor: e => e.description },
    { value: 'id', label: 'Exercise id', accessor: e => e.id?.toString() },
    { value: 'status', label: 'Status', accessor: e => e.status },
  ];

  constructor(private store: Store, private actions$: Actions) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.subscriptions.push(watchLoadError(this.actions$, loadExercisesFailure, [loadExercises, loadExercisesSuccess], null, m => this.loadError = m));
    this.store.dispatch(loadExercises());
    this.subscriptions.push(
      this.store.select(selectExercises).subscribe((allExercises) => {
        this.exercisesData = allExercises;
        this.totalExercises = allExercises.length
        this.exercisesLength = allExercises.length
      })
    );
  }

  handleSearchResults(results: Exercises[]): void {
    this.exercisesData = results;
    this.totalExercises = results.length;
  }


  retryLoad(): void {
    this.store.dispatch(loadExercises());
  }
}
