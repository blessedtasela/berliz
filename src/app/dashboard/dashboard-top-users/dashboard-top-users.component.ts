import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectUsers } from 'src/app/state/user/user.selector';
import { loadAllUsers } from 'src/app/state/user/user.actions';

@Component({
  selector: 'app-dashboard-top-users',
  templateUrl: './dashboard-top-users.component.html',
  styleUrls: ['./dashboard-top-users.component.css']
})
export class DashboardTopUsersComponent {
  users: Users[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  subscriptions: Subscription[] = []

  constructor(private store: Store,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private router: Router,
    private rxStompService: RxStompService) { }

  photoSrc(user: Users): string {
    return user.profilePhoto
      ? 'data:image/*;base64,' + user.profilePhoto
      : '../../../assets/icons/user.png';
  }

  goToProfile(user: Users): void {
    this.router.navigate(['/user', user.id]);
  }

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
    this.store.dispatch(loadAllUsers());
    this.subscriptions.push(
      this.store.select(selectUsers).subscribe((users) => {
        this.users = users;
      }),
    );
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


