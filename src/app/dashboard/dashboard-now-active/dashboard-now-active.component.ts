import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';

@Component({
  selector: 'app-dashboard-now-active',
  templateUrl: './dashboard-now-active.component.html',
  styleUrls: ['./dashboard-now-active.component.css']
})
export class DashboardNowActiveComponent {
  users: Users[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  subscriptions: Subscription[] = []

  constructor(private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.handleEmitEvent()
    // this.userStateService.allUsersData$.subscribe((cachedData) => {
    //   if (!cachedData) {
    //     this.handleEmitEvent()
    //   } else {
    //     this.users = cachedData;
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

  handleEmitEvent() {
    this.ngxService.start();
    this.subscriptions.push(
      this.userStateService.getAllUsers().subscribe((users) => {
        this.users = users;
        this.userStateService.setAllUsersSubject(this.users);
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
      const receivedUsers: Users = JSON.parse(message.body);
      this.users.push(receivedUsers);
    });
  }

  watchUpdateTodoList() {
    this.rxStompService.watch('/topic/updateTodoList').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      const userId = this.users.findIndex(Users => Users.id === receivedUsers.id)
      this.users[userId] = receivedUsers
    });
  }

  watchUpdateTodoStatus() {
    this.rxStompService.watch('/topic/updateTodoStatus').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      const userId = this.users.findIndex(Users => Users.id === receivedUsers.id)
      this.users[userId] = receivedUsers
    });
  }

  watchDeleteTodo() {
    this.rxStompService.watch('/topic/deleteTodo').subscribe((message) => {
      const receivedNewsletter: Users = JSON.parse(message.body);
      this.users = this.users.filter(todo => todo.id !== receivedNewsletter.id);
    });
  }

}


