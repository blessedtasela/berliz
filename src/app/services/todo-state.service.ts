import { Injectable } from '@angular/core';
import { TodoService } from './todo.service';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { TodoList } from '../models/todoList.interface';
import { SnackBarService } from './snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class TodoStateService {
  private myTodoSubject = new BehaviorSubject<any>(null);
  public myTodoData$: Observable<TodoList[]> = this.myTodoSubject.asObservable();
  private allTodosSubject = new BehaviorSubject<any>(null);
  public allTodosData$: Observable<TodoList[]> = this.allTodosSubject.asObservable();
  responseMessage: any;

  constructor(private todoService: TodoService,
    private snackbarService: SnackBarService) { }

  setmyTodosSubject(data: TodoList[]) {
    this.myTodoSubject.next(data);
  }

  setAllTodosSubject(data: TodoList[]) {
    this.allTodosSubject.next(data);
  }

  getAllTodos(): Observable<TodoList[]> {
    return this.todoService.getAllTodos().pipe(
      tap((response: any) => {
        return response.sort((a: TodoList, b: TodoList) => {
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

  getMyTodos(): Observable<TodoList[]> {
    return this.todoService.getmyTodos().pipe(
      tap((response: any) => {
        return response.sort((a: TodoList, b: TodoList) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        })
      }),
      catchError((error) => {
        console.log(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
          console.log(this.responseMessage);
        } else {
          this.responseMessage = genericError;
        }
        console.log(this.responseMessage, 'error');
        return of([]);
      })
    );
  }
}


