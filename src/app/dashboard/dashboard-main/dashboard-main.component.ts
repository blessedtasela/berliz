import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { TodoList } from 'src/app/models/todoList.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StateService } from 'src/app/services/state.service';
import { TodaysTodoModalComponent } from '../todays-todo-modal/todays-todo-modal.component';
import { Users } from 'src/app/models/users.interface';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { Store } from '@ngrx/store';
import { selectUser } from 'src/app/state/user/user.selector';
import { loadMyTodos } from 'src/app/state/todo/todo.actions';
import { selectMyTodos } from 'src/app/state/todo/todo.selectors';
import { loadDashboard } from 'src/app/state/dashboard/dashboard.actions';
import { selectDashboardData } from 'src/app/state/dashboard/dashboard.selectors';
import { loadMySubscriptions } from 'src/app/state/subscription/subscription.actions';
import { selectMySubscriptions } from 'src/app/state/subscription/subscription.selectors';

@Component({
  selector: 'app-dashboard-main',
  templateUrl: './dashboard-main.component.html',
  styleUrls: ['./dashboard-main.component.css']
})
export class DashboardMainComponent {

  userData: Users | null = null;
  data: any;
  myTodo: TodoList[] = [];
  mySubscriptions: Subscriptions[] = [];
  currentRoute: string = '';
  successMessage = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private store: Store,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
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
      this.store.select(selectUser).subscribe(user => {
        this.userData = user;
      }),

      this.store.select(selectDashboardData).subscribe(data => {
        this.data = data;
      }),

      this.store.select(selectMyTodos).subscribe(myTodo => {
        this.myTodo = myTodo;
      }),

      this.store.select(selectMySubscriptions).subscribe(subscriptions => {
        this.mySubscriptions = subscriptions;
      })
    );
    this.store.dispatch(loadMyTodos());
    this.store.dispatch(loadDashboard());
    this.store.dispatch(loadMySubscriptions());
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