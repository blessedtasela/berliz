import { Injectable } from '@angular/core';
import { MuscleGroups } from '../models/muscle-groups.interface';
import { MuscleGroupService } from './muscle-group.service';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { Categories } from '../models/categories.interface';
import { SnackBarService } from './snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class MuscleGroupStateService {
  private activeMuscleGroupsSubject = new BehaviorSubject<any>(null);
  public activeMuscleGroupsData$: Observable<MuscleGroups[]> = this.activeMuscleGroupsSubject.asObservable();
  private allMuscleGroupsSubject = new BehaviorSubject<any>(null);
  public allMuscleGroupData$: Observable<MuscleGroups[]> = this.allMuscleGroupsSubject.asObservable();
  responseMessage: any;

  constructor(private muscleGroupService: MuscleGroupService,
    private snackbarService: SnackBarService) { }

  setActiveMuscleGroupsSubject(data: MuscleGroups[]) {
    this.activeMuscleGroupsSubject.next(data);
  }

  setAllMuscleGroupsSubject(data: MuscleGroups[]) {
    this.allMuscleGroupsSubject.next(data);
  }

  getMuscleGroups(): Observable<MuscleGroups[]> {
    return this.muscleGroupService.getMuscleGroups().pipe(
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

  getActiveMuscleGroups(): Observable<MuscleGroups[]> {
    return this.muscleGroupService.getActiveMuscleGroups().pipe(
      tap((response: any) => {
        return response.sort((a: Categories, b: Categories) => {
          return a.name.localeCompare(b.name);
        })
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


