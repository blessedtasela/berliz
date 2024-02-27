import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TodoList } from 'src/app/models/todoList.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { TodoStateService } from 'src/app/services/todo-state.service';

@Component({
  selector: 'app-todo-lists',
  templateUrl: './todo-lists.component.html',
  styleUrls: ['./todo-lists.component.css']
})
export class TodoListsComponent {
  todoListData: TodoList[] = [];
  totalTodoList: number = 0;
  todoListLength: number = 0;
  searchComponent: string = 'todoList'
  isSearch: boolean = true;

  constructor(private todoStateService: TodoStateService,
    private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private rxStompService: RxStompService) {
  }

  ngOnInit(): void {
    this.ngxService.start()
    this.watchDeleteTodo()
    this.watchGetTodoFromMap()
    this.watchUpdateTodoList()
    this.watchUpdateTodoStatus()
    this.watchTodoBulkAction()
    this.handleEmitEvent()
    this.ngxService.stop()
    // this.todoStateService.allTodosData$.subscribe((cachedData) => {
    //   if (cachedData === null) {
    //     this.handleEmitEvent()
    //   } else {
    //     this.todoListData = cachedData;
    //     this.totalTodoList = cachedData.length
    //     this.todoListLength = cachedData.length
    //   }
    // });
  }

  handleEmitEvent() {
    this.todoStateService.getAllTodos().subscribe((todo) => {
      console.log('isCachedData false')
      this.todoListData = todo;
      this.totalTodoList = todo.length
      this.todoListLength = todo.length;
      this.todoStateService.setAllTodosSubject(this.todoListData);
    });
  }

  handleSearchResults(results: TodoList[]): void {
    this.todoListData = results;
    this.totalTodoList = results.length;
  }

  watchGetTodoFromMap() {
    this.rxStompService.watch('/topic/getTodoFromMap').subscribe((message) => {
      this.handleEmitEvent()
  
    });
  }

  watchDeleteTodo() {
    this.rxStompService.watch('/topic/deleteTodo').subscribe((message) => {
      this.handleEmitEvent()
    });
  }
  
  watchUpdateTodoList() {
    this.rxStompService.watch('/topic/updateTodoList').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchTodoBulkAction() {
    this.rxStompService.watch('/topic/todoBulkAction').subscribe((message) => {
      this.handleEmitEvent();
    });
  }

  watchUpdateTodoStatus() {
    this.rxStompService.watch('/topic/updateTodoStatus').subscribe((message) => {
      this.handleEmitEvent()
      // const receivedTodo: TodoList = JSON.parse(message.body);
      // const todoId = this.todoListData.findIndex(todoList => todoList.id === receivedTodo.id)
      // this.todoListData[todoId] = receivedTodo
    });
  }

}
