import { Injectable } from '@angular/core';
import { SubTasks, Tasks } from '../models/tasks.interface';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { SnackBarService } from './snack-bar.service';
import { TaskService } from './task.service';

@Injectable({
  providedIn: 'root'
})
export class TaskStateService {
  private activeTasksSubject = new BehaviorSubject<any>(null);
  public activeTasksData$: Observable<Tasks[]> = this.activeTasksSubject.asObservable();
  private allTasksSubject = new BehaviorSubject<any>(null);
  public allTasksData$: Observable<Tasks[]> = this.allTasksSubject.asObservable();
  private taskSubject = new BehaviorSubject<any>(null);
  public taskData$: Observable<Tasks> = this.taskSubject.asObservable();
  private trainerTasksSubect = new BehaviorSubject<any>(null);
  public trainerTasksData$: Observable<Tasks[]> = this.trainerTasksSubect.asObservable();
  private clientTasksSubject = new BehaviorSubject<any>(null);
  public clientTasksData$: Observable<Tasks[]> = this.clientTasksSubject.asObservable();
  private subTasksSubject = new BehaviorSubject<any>(null);
  public subTasksData$: Observable<SubTasks[]> = this.subTasksSubject.asObservable();
  responseMessage: any;

  constructor(private taskService: TaskService,
    private snackbarService: SnackBarService) { }

  setTaskSubject(data: Tasks) {
    this.taskSubject.next(data);
  }

  setActiveTasksSubject(data: Tasks[]) {
    this.activeTasksSubject.next(data);
  }

  setAllTasksSubject(data: Tasks[]) {
    this.allTasksSubject.next(data);
  }

  setTrainerTasksSubject(data: Tasks[]) {
    this.trainerTasksSubect.next(data);
  }

  setClientTasksSubject(data: Tasks[]) {
    this.clientTasksSubject.next(data);
  }

  setSubTasksSubject(data: SubTasks[]) {
    this.subTasksSubject.next(data);
  }


  getTask(): Observable<Tasks> {
    return this.taskService.getTask().pipe(
      tap((response: any) => {
        return response;
      }), catchError((error: any) => {
        console.log(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
          console.log(this.responseMessage, 'error');
        } else {
          console.log(genericError)
        }
        return of();
      })
    );
  }

  getAllTasks(): Observable<Tasks[]> {
    return this.taskService.getAllTasks().pipe(
      tap((response: any) => {
        return response.sort((a: Tasks, b: Tasks) => {
          return a.user.firstname.localeCompare(b.user.firstname);
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

  getActiveTasks(): Observable<Tasks[]> {
    return this.taskService.getActiveTasks().pipe(
      tap((response: any) => {
        return response.sort((a: Tasks, b: Tasks) => {
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

  getTrainerTasks(): Observable<Tasks[]> {
    return this.taskService.getTrainerTasks().pipe(
      tap((response: any) => {
        return response.sort((a: Tasks, b: Tasks) => {
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

  getClientTasks(): Observable<Tasks[]> {
    return this.taskService.getClientTasks().pipe(
      tap((response: any) => {
        return response.sort((a: Tasks, b: Tasks) => {
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

  getSubTasks(): Observable<SubTasks[]> {
    return this.taskService.getAllSubTasks().pipe(
      tap((response: any) => {
        return response.sort((a: Tasks, b: Tasks) => {
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

}
