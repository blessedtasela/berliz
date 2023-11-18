import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { TodoList } from 'src/app/models/todoList.interface';
import { CenterStateService } from 'src/app/services/center-state.service';
import { TodoStateService } from 'src/app/services/todo-state.service';

@Component({
  selector: 'app-todo-list-page',
  templateUrl: './todo-list-page.component.html',
  styleUrls: ['./todo-list-page.component.css']
})
export class TodoListPageComponent {
  todoData: TodoList[] = [];
  totalTodos: number = 0;
  todosLength: number = 0;
  searchComponent: string = 'todoList';
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];

  constructor(private ngxService: NgxUiLoaderService,
    public todoStateService: TodoStateService) {
  }

  ngOnInit(): void {
    this.todoStateService.myTodoData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.todoData = cachedData;
        this.totalTodos = cachedData.length
        this.todosLength = cachedData.length
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => (subscription.unsubscribe()));
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.subscriptions.push(
      this.todoStateService.getMyTodos().subscribe((myTodos) => {
        console.log('isCachedData false')
        this.todoData = myTodos;
        this.totalTodos = myTodos.length
        this.todosLength = myTodos.length
        this.todoStateService.setmyTodosSubject(this.todoData);
      }),
    );
    this.ngxService.stop()
  }

  handleSearchResults(results: TodoList[]): void {
    this.todoData = results;
    this.totalTodos = results.length;
  }

  emitData() {
    this.handleEmitEvent();
  }

}

