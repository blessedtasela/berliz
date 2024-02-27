import { AfterViewInit, Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { TodoList } from 'src/app/models/todoList.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
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
    public todoStateService: TodoStateService,
    private rxStompService: RxStompService) {
  }

  ngOnInit(): void {
    this.ngxService.start()
    this.handleEmitEvent()
    this.watchDeleteTodo()
    this.watchTodoBulkAction()
    this.watchGetTodoFromMap()
    this.watchUpdateTodoList()
    this.watchUpdateTodoStatus()
    this.ngxService.stop()
    // this.todoStateService.myTodoData$.subscribe((cachedData) => {
    //   if (!cachedData) {
    //     this.handleEmitEvent()
    //   } else {
    //     this.todoData = cachedData;
    //     this.totalTodos = cachedData.length
    //     this.todosLength = cachedData.length
    //   }
    // });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => (subscription.unsubscribe()));
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.todoStateService.getMyTodos().subscribe((myTodos) => {
        console.log('isCachedData false')
        this.todoData = myTodos;
        this.totalTodos = myTodos.length
        this.todosLength = myTodos.length
        this.todoStateService.setmyTodosSubject(myTodos);
      }),
    );
  }

  handleSearchResults(results: TodoList[]): void {
    this.todoData = results;
    this.totalTodos = results.length;
  }

  emitData() {
    this.handleEmitEvent();
  }

  watchGetTodoFromMap() {
    this.rxStompService.watch('/topic/getTodoFromMap').subscribe((message) => {
      this.handleEmitEvent();
      // const receivedTodo: TodoList = JSON.parse(message.body);
      // this.todoData.push(receivedTodo);
      // this.totalTodos = this.todoData.length;
    });
  }

  watchTodoBulkAction() {
    this.rxStompService.watch('/topic/todoBulkAction').subscribe((message) => {
      this.handleEmitEvent();
      // const receivedTodo: TodoList = JSON.parse(message.body);
      // this.todoData.push(receivedTodo);
      // this.totalTodos = this.todoData.length;
    });
  }

  watchUpdateTodoList() {
    this.rxStompService.watch('/topic/updateTodoList').subscribe((message) => {
      this.handleEmitEvent();
      // const receivedTodo: TodoList = JSON.parse(message.body);
      // const todoId = this.todoData.findIndex(todoList => todoList.id === receivedTodo.id)
      // this.todoData[todoId] = receivedTodo
    });
  }

  watchUpdateTodoStatus() {
    this.rxStompService.watch('/topic/updateTodoStatus').subscribe((message) => {
      this.handleEmitEvent();
      // const receivedTodo: TodoList = JSON.parse(message.body);
      // const todoId = this.todoData.findIndex(todoList => todoList.id === receivedTodo.id)
      // this.todoData[todoId] = receivedTodo
    });
  }

  watchDeleteTodo() {
    this.rxStompService.watch('/topic/deleteTodo').subscribe((message) => {
      this.handleEmitEvent();
      // const receivedNewsletter: TodoList = JSON.parse(message.body);
      // this.todoData = this.todoData.filter(todo => todo.id !== receivedNewsletter.id);
      // this.totalTodos = this.todoData.length;
    });
  }

}

