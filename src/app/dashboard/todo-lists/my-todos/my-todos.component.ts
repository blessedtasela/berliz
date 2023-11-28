import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { TodoList } from 'src/app/models/todoList.interface';
import { TodoStateService } from 'src/app/services/todo-state.service';

@Component({
  selector: 'app-my-todos',
  templateUrl: './my-todos.component.html',
  styleUrls: ['./my-todos.component.css']
})
export class MyTodosComponent {
  todoData: TodoList[] = [];
  totalTodos: number = 0;
  todosLength: number = 0;
  searchComponent: string = 'myTodo';
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

