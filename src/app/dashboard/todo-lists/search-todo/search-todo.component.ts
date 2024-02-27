import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { TodoList } from 'src/app/models/todoList.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TodoStateService } from 'src/app/services/todo-state.service';

@Component({
  selector: 'app-search-todo',
  templateUrl: './search-todo.component.html',
  styleUrls: ['./search-todo.component.css']
})
export class SearchTodoComponent {
  myTodos: TodoList[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'task';
  filteredMyTodos: TodoList[] = [];
  @Output() results: EventEmitter<TodoList[]> = new EventEmitter<TodoList[]>()

  constructor(private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private todoStateService: TodoStateService,
    private elementRef: ElementRef) {
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
        (results: TodoList[]) => {
          this.ngxService.stop();
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  onSearchCriteriaChange(event: any): void {
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
  }

  search(query: string): Observable<TodoList[]> {
    this.todoStateService.myTodoData$.subscribe((cachedData) => {
      this.myTodos = cachedData;
    })
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredMyTodos = this.myTodos;
    }
    this.filteredMyTodos = this.myTodos.filter((myTodos: TodoList) => {
      switch (this.selectedSearchCriteria) {
        case 'task':
          return myTodos.task.toLowerCase().includes(query);
        case 'id':
          return myTodos.id.toString().includes(query);
        case 'status':
          return myTodos.status.toLowerCase().includes(query);
        case 'lastUpdate':
          return myTodos.lastUpdate.toDateString().includes(query);
        default:
          return false;
      }
    });
    return of(this.filteredMyTodos);
  }

}


