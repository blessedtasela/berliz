import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TodoList } from 'src/app/models/todoList.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { loadTodos } from 'src/app/state/todo/todo.actions';
import { selectTodos } from 'src/app/state/todo/todo.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

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
  subscriptions: Subscription[] = [];

  readonly selectTodos = selectTodos;
  readonly todoSearchFields: AdminSearchField<TodoList>[] = [
    { value: 'task', label: 'Task', accessor: t => t.task },
    { value: 'user', label: 'User', accessor: t => `${t.userFirstname || ''} ${t.userLastname || ''} ${t.userEmail || ''}` },
    { value: 'status', label: 'Status', accessor: t => t.status },
    { value: 'priority', label: 'Priority', accessor: t => t.priority },
    { value: 'id', label: 'Todo id', accessor: t => t.id?.toString() },
  ];

  constructor(private store: Store,
    private dialog: MatDialog,
    private rxStompService: RxStompService) {
  }

  ngOnInit(): void {
    this.watchDeleteTodo()
    this.watchGetTodoFromMap()
    this.watchUpdateTodoList()
    this.watchUpdateTodoStatus()
    this.watchTodoBulkAction()
    this.handleEmitEvent()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.store.dispatch(loadTodos());
    this.subscriptions.push(
      this.store.select(selectTodos).subscribe((todo) => {
        this.todoListData = todo;
        this.totalTodoList = todo.length
        this.todoListLength = todo.length;
      })
    );
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
    });
  }

}
