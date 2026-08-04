import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Exercises } from 'src/app/models/exercise.interface';
import { loadExercises } from 'src/app/state/exercise/exercise.actions';
import { selectExercises } from 'src/app/state/exercise/exercise.selectors';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.css']
})
export class ExercisesComponent {
  exercisesData: Exercises[] = [];
  totalExercises: number = 0;
  exercisesLength: number = 0;
  searchComponent: string = 'exercise'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];

  constructor(private ngxService: NgxUiLoaderService,
    private store: Store) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadExercises());
    this.subscriptions.push(
      this.store.select(selectExercises).subscribe((allExercises) => {
        this.exercisesData = allExercises;
        this.totalExercises = allExercises.length
        this.exercisesLength = allExercises.length
        this.ngxService.stop()
      })
    );
  }

  handleSearchResults(results: Exercises[]): void {
    this.exercisesData = results;
    this.totalExercises = results.length;
  }

}
