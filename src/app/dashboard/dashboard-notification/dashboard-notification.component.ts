import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { TodoList } from 'src/app/models/todoList.interface';
import { NotificationStateService } from 'src/app/services/notification-state.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TodoStateService } from 'src/app/services/todo-state.service';
import { TodoService } from 'src/app/services/todo.service';

@Component({
  selector: 'app-dashboard-notification',
  templateUrl: './dashboard-notification.component.html',
  styleUrls: ['./dashboard-notification.component.css']
})
export class DashboardNotificationComponent {
 notifications: TodoList[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  subscriptions: Subscription[] = []

  constructor(private notificationStateService: NotificationStateService,
    private todoService: TodoService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private rxStompService: RxStompService) { }


  ngOnInit(): void {
    // this.notificationStateService.myTodoData$.subscribe((cachedData: any) => {
    //   if (!cachedData) {
    //     this.handleEmitEvent()
    //   } else {
    //     this.notifications = cachedData;
    //   }
    // });
    this.watchDeleteTodo()
    this.watchGetTodoFromMap()
    this.watchUpdateTodoList()
    this.watchUpdateTodoStatus()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => (sub.unsubscribe()))
  }

  // handleEmitEvent() {
  //   this.ngxService.start();
  //   this.subscriptions.push(
  //     this.notificationStateService.getMyTodos().subscribe((myTodo) => {
  //       this.notifications = myTodo;
  //       this.notificationStateService.setmyTodosSubject(this.notifications);
  //     }),
  //   );
  //   this.ngxService.stop();
  // }


 

  formatDate(dateString: any): string {
    const date = new Date(dateString);
    return date.toDateString();
  }

  watchGetTodoFromMap() {
    this.rxStompService.watch('/topic/getTodoFromMap').subscribe((message) => {
      const receivedTodo: TodoList = JSON.parse(message.body);
      this.notifications.push(receivedTodo);
    });
  }

  watchUpdateTodoList() {
    this.rxStompService.watch('/topic/updateTodoList').subscribe((message) => {
      const receivedTodo: TodoList = JSON.parse(message.body);
      const todoId = this.notifications.findIndex(todoList => todoList.id === receivedTodo.id)
      this.notifications[todoId] = receivedTodo
    });
  }

  watchUpdateTodoStatus() {
    this.rxStompService.watch('/topic/updateTodoStatus').subscribe((message) => {
      const receivedTodo: TodoList = JSON.parse(message.body);
      const todoId = this.notifications.findIndex(todoList => todoList.id === receivedTodo.id)
      this.notifications[todoId] = receivedTodo
    });
  }

  watchDeleteTodo() {
    this.rxStompService.watch('/topic/deleteTodo').subscribe((message) => {
      const receivedNewsletter: TodoList = JSON.parse(message.body);
      this.notifications = this.notifications.filter(todo => todo.id !== receivedNewsletter.id);
    });
  }

}


