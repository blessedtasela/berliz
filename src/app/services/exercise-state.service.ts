import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { Categories } from '../models/categories.interface';
import { Exercises } from '../models/exercise.interface';
import { SnackBarService } from './snack-bar.service';
import { ExerciseService } from './exercise.service';

@Injectable({
  providedIn: 'root'
})
export class ExerciseStateService {
  private activeExercisesSubject = new BehaviorSubject<any>(null);
  public activeExercisesData$: Observable<Exercises[]> = this.activeExercisesSubject.asObservable();
  private allExercisesSubject = new BehaviorSubject<any>(null);
  public allExerciseData$: Observable<Exercises[]> = this.allExercisesSubject.asObservable();
  responseMessage: any;

  constructor(private exerciseService: ExerciseService,
    private snackbarService: SnackBarService) { }

  setActiveExercisesSubject(data: Exercises[]) {
    this.activeExercisesSubject.next(data);
  }

  setAllExercisesSubject(data: Exercises[]) {
    this.allExercisesSubject.next(data);
  }

  getExercises(): Observable<Exercises[]> {
    return this.exerciseService.getExercises().pipe(
      tap((response: any) => {
        return response.sort((a: Categories, b: Categories) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        })
      }),
      catchError((error) => {
        this.snackbarService.openSnackBar(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
        return of([]);
      })
    );
  }

  getActiveExercises(): Observable<Exercises[]> {
    return this.exerciseService.getActiveExercises().pipe(
      tap((response: any) => {
        if (response) {
          return response.sort((a: Categories, b: Categories) => {
            return a.name.localeCompare(b.name);
          })
        }
      }),
      catchError((error) => {
        console.log(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        console.log(this.responseMessage, 'error');
        return of([]);
      })
    );
  }
}


