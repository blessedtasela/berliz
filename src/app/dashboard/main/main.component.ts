import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { TodaysTodoModalComponent } from '../todays-todo-modal/todays-todo-modal.component';
import { StateService } from 'src/app/services/state.service';
import { TodoStateService } from 'src/app/services/todo-state.service';
import { Subscription } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { DashboardStateService } from 'src/app/services/dashboard-state.service';
import { TodoList } from 'src/app/models/todoList.interface';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  userData!: Users;
  data: any;
  myTodo: TodoList[] = [];
  currentRoute: string = '';
  successMessage = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private todoStateService: TodoStateService,
    private dashboardStateService: DashboardStateService,
    private dialog: MatDialog,
    private stateService: StateService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  ngOnInit() {
    this.loadAllData();
    this.handleTodaysTodoPopup();
  }

  private loadAllData() {
    this.subscriptions.push(
      this.userStateService.getUser().subscribe(user => {
        this.userData = user;
        this.userStateService.setUserSubject(user);
      }),

      this.dashboardStateService.getDashBoard().subscribe(data => {
        this.data = data;
        this.dashboardStateService.setDashboardSubject(data);
      }),

      this.todoStateService.getMyTodos().subscribe(myTodo => {
        this.myTodo = myTodo;
        this.todoStateService.setmyTodosSubject(myTodo);
      })
    );
  }

  private handleTodaysTodoPopup() {
    const showPopup = this.stateService.getTodaysTodo();

    if (showPopup !== 'true') {
      setTimeout(() => {
        this.openTodaysTodo();
        this.stateService.setTodaysTodo('true');
      }, 1000);
    }
  }

  openTodaysTodo() {
    const dialogRef = this.dialog.open(TodaysTodoModalComponent, {
      minWidth: '400px',
      minHeight: '200px',
      disableClose: true
    });

    const child = dialogRef.componentInstance as TodaysTodoModalComponent;

    child.emitEvent.subscribe(() => {
      this.successMessage = true;
      this.loadAllData();
      dialogRef.close();
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}