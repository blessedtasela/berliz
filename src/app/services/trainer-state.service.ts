import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of, Subject } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { Trainers } from '../models/trainers.interface';
import { SnackBarService } from './snack-bar.service';
import { TrainerService } from './trainer.service';
import { TrainerLike } from '../models/users.interface';
import { RxStompService } from './rx-stomp.service';

@Injectable({
  providedIn: 'root'
})
export class TrainerStateService {
  private activeTrainersSubject = new BehaviorSubject<any>(null);
  public activeTrainersData$: Observable<Trainers[]> = this.activeTrainersSubject.asObservable();
  private allTrainersSubject = new BehaviorSubject<any>(null);
  public allTrainersData$: Observable<Trainers[]> = this.allTrainersSubject.asObservable();
  private trainerSubject = new BehaviorSubject<any>(null);
  public trainerData$: Observable<Trainers> = this.trainerSubject.asObservable();
  private likeTrainersSubject = new BehaviorSubject<any>(null);
  public likeTrainersData$: Observable<TrainerLike[]> = this.likeTrainersSubject.asObservable();
  responseMessage: any;



  constructor(private trainerService: TrainerService,
    private snackbarService: SnackBarService,
    private rxStompService: RxStompService,) { }

  setTrainerSubject(data: Trainers) {
    this.trainerSubject.next(data);
  }

  setActiveTrainersSubject(data: Trainers[]) {
    this.activeTrainersSubject.next(data);
  }

  setAllTrainersSubject(data: Trainers[]) {
    this.allTrainersSubject.next(data);
  }

  setLikeTrainersSubject(data: TrainerLike[]) {
    this.likeTrainersSubject.next(data);
  }


  getTrainer(): Observable<Trainers> {
    return this.trainerService.getTrainer().pipe(
      tap((response: any) => {
        return response;
      }), catchError((error: any) => {
        console.log(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        console.log(this.responseMessage, 'error');
        return of();
      })
    );
  }

  getAllTrainers(): Observable<Trainers[]> {
    return this.trainerService.getAllTrainers().pipe(
      tap((response: any) => {
        return response.sort((a: Trainers, b: Trainers) => {
          return a.name.localeCompare(b.name);
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

  getActiveTrainers(): Observable<Trainers[]> {
    return this.trainerService.getActiveTrainers().pipe(
      tap((response: any) => {
        return response.sort((a: Trainers, b: Trainers) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        })
      }),
      catchError((error) => {
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

  getTrainerLikes(): Observable<TrainerLike[]> {
    return this.trainerService.getTrainerLikes().pipe(
      tap((response: any) => {
        return response;
      }),
      catchError((error) => {
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
