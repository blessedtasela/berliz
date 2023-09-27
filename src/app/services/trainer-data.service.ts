import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { SnackBarService } from './snack-bar.service';
import { Trainers } from '../models/trainers.interface';
import { TrainerService } from './trainer.service';

@Injectable({
  providedIn: 'root'
})
export class TrainerDataService {
  trainerData!: Trainers;
  responseMessage: any;
  trainers!: Trainers;

  constructor(private trainerService: TrainerService,
    private snackbarService: SnackBarService,) { }

    ngOnInit() {
    
    }

  getTrainer(): Observable<Trainers> {
    return this.trainerService.getTrainer().pipe(
      tap((response: any) => {
        this.trainerData = response;
      }), catchError((error: any) => {
        this.snackbarService.openSnackBar(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
        return of();
      })
    );
  }

  getAllTrainers(): Observable<Trainers[]> {
    return this.trainerService.getAllTrainers().pipe(
      tap((response: any) => {
        this.trainers = response;
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
}
