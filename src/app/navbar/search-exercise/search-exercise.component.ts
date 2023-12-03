import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Exercises } from 'src/app/models/exercise.interface';
import { ExerciseStateService } from 'src/app/services/exercise-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-search-exercise',
  templateUrl: './search-exercise.component.html',
  styleUrls: ['./search-exercise.component.css']
})
export class SearchExerciseComponent {
  exercisesData: Exercises[] = [];
  filteredExercisesData: Exercises[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  @Output() results: EventEmitter<Exercises[]> = new EventEmitter<Exercises[]>()


  constructor(private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef,
    public exerciseStateService: ExerciseStateService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }

  initializeSearch(): void {
    fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap(() => {
          this.ngxService.start();
        }),
        switchMap((query: string) => {
          return this.search(query);
        })
      )
      .subscribe(
        (results: Exercises[]) => {
          this.ngxService.stop();
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  search(query: string): Observable<Exercises[]> {
    this.exerciseStateService.allExerciseData$.subscribe((cachedData) => {
      this.exercisesData = cachedData;
    });
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredExercisesData = this.exercisesData;
    }
    this.filteredExercisesData = this.exercisesData.filter((exercise: Exercises) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return exercise.name && exercise.name.toLowerCase().includes(query);
        case 'id':
          return exercise.id && exercise.id.toString().includes(query);
        case 'description':
          return exercise.description && exercise.description.toLowerCase().includes(query);
        case 'status':
          return exercise.status && exercise.status.toLowerCase().includes(query);
        case 'exercise':
          return (
            exercise.muscleGroups.length > 0 &&
            exercise.muscleGroups.some((exercise) => exercise.name.toLowerCase().includes(query))
          );
        case 'category':
          return (
            exercise.categories.length > 0 &&
            exercise.categories.some((categories) => categories.name.toLowerCase().includes(query))
          );
        default:
          return false;
      }
    });
    return of(this.filteredExercisesData);
  }

  onSearchCriteriaChange(event: any): void {
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
  }

}

