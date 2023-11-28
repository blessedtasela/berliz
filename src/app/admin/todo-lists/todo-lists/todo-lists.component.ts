import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TodoList } from 'src/app/models/todoList.interface';
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
    private dialog: MatDialog,) {
  }

  ngOnInit(): void {
    this.todoStateService.allTodosData$.subscribe((cachedData) => {
      if (cachedData === null) {
        this.handleEmitEvent()
      } else {
        this.todoListData = cachedData;
        this.totalTodoList = cachedData.length
        this.todoListLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.todoStateService.getAllTodos().subscribe((todo) => {
      console.log('isCachedData false')
      this.ngxService.start()
      this.todoListData = todo;
      this.totalTodoList = todo.length
      this.todoListLength = todo.length;
      this.todoStateService.setAllTodosSubject(this.todoListData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: TodoList[]): void {
    this.todoListData = results;
    this.totalTodoList = results.length;
  }

}
