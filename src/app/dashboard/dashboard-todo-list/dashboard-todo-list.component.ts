import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { TodoList } from 'src/app/models/todoList.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TodoStateService } from 'src/app/services/todo-state.service';
import { TodoService } from 'src/app/services/todo.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { EditTodoComponent } from '../todo-lists/edit-todo/edit-todo.component';

@Component({
  selector: 'app-dashboard-todo-list',
  templateUrl: './dashboard-todo-list.component.html',
  styleUrls: ['./dashboard-todo-list.component.css']
})
export class DashboardTodoListComponent {
  todoData: TodoList[] = [];
  responseMessage: any;
  subscriptions: Subscription[] = []

  constructor(private todoStateService: TodoStateService,
    private ngxService: NgxUiLoaderService,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.todoStateService.myTodoData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.todoData = cachedData;
      }
    });
    this.watchDeleteTodo()
    this.watchGetTodoFromMap()
    this.watchUpdateTodoList()
    this.watchUpdateTodoStatus()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => (sub.unsubscribe()))
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.subscriptions.push(
      this.todoStateService.getMyTodos().subscribe((myTodo) => {
        this.todoData = myTodo;
        this.todoStateService.setmyTodosSubject(this.todoData);
      }),
    );
    this.ngxService.stop();
  }

  formatDate(dateString: any): string {
    const date = new Date(dateString);
    return date.toDateString();
  }

  watchGetTodoFromMap() {
    this.rxStompService.watch('/topic/getTodoFromMap').subscribe((message) => {
      const receivedTodo: TodoList = JSON.parse(message.body);
      this.todoData.push(receivedTodo);
    });
  }

  watchUpdateTodoList() {
    this.rxStompService.watch('/topic/updateTodoList').subscribe((message) => {
      const receivedTodo: TodoList = JSON.parse(message.body);
      const todoId = this.todoData.findIndex(todoList => todoList.id === receivedTodo.id)
      this.todoData[todoId] = receivedTodo
    });
  }

  watchUpdateTodoStatus() {
    this.rxStompService.watch('/topic/updateTodoStatus').subscribe((message) => {
      const receivedTodo: TodoList = JSON.parse(message.body);
      const todoId = this.todoData.findIndex(todoList => todoList.id === receivedTodo.id)
      this.todoData[todoId] = receivedTodo
    });
  }

  watchDeleteTodo() {
    this.rxStompService.watch('/topic/deleteTodo').subscribe((message) => {
      const receivedNewsletter: TodoList = JSON.parse(message.body);
      this.todoData = this.todoData.filter(todo => todo.id !== receivedNewsletter.id);
    });
  }

}



