import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Exercises } from 'src/app/models/exercise.interface';
import { ExerciseStateService } from 'src/app/services/exercise-state.service';

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

  constructor(private ngxService: NgxUiLoaderService,
    private exerciseStateService: ExerciseStateService) {
  }

  ngOnInit(): void {
    this.exerciseStateService.allExerciseData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.exercisesData = cachedData;
        this.totalExercises = cachedData.length
        this.exercisesLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.exerciseStateService.getExercises().subscribe((allExercises) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.exercisesData = allExercises;
      this.totalExercises = allExercises.length
      this.exercisesLength = allExercises.length
      this.exerciseStateService.setAllExercisesSubject(this.exercisesData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: Exercises[]): void {
    this.exercisesData = results;
    this.totalExercises = results.length;
  }

}
