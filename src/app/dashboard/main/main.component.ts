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
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  userData!: Users;
  data: any;
  loginChart: any;
  analyticChart: any;
  activityChart: any;
  myTodo: TodoList[] = [];
  currentRoute: any;
  successMessage: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(private router: Router,
    private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private todoStateService: TodoStateService,
    private dashboardStateService: DashboardStateService,
    private dialog: MatDialog,
    private stateService: StateService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  ngOnInit() {
    this.handleEmitEvent()
    const showTodaysTodo = this.stateService.getTodaysTodo();
    if (showTodaysTodo !== "true") {
      setTimeout(() => {
        this.openTodaysTodo();
        this.stateService.setTodaysTodo("true");
      }, 1000);
    };
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.userStateService.getUser().subscribe((user) => {
        this.ngxService.start()
        this.userData = user;
        this.userStateService.setUserSubject(user);
        this.ngxService.stop()
      }),
      this.dashboardStateService.getDashBoard().subscribe((data) => {
        this.ngxService.start()
        this.data = data;
        this.createLogDeviceChart()
        this.createAnalyticChart()
        this.createActivityChart()
        this.dashboardStateService.setDashboardSubject(data);
        this.ngxService.stop()
      }),
      this.todoStateService.getMyTodos().subscribe((myTodo) => {
        this.ngxService.start()
        this.myTodo = myTodo;
        this.todoStateService.setmyTodosSubject(myTodo);
        this.ngxService.stop()
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => (sub.unsubscribe()))
  }

  openTodaysTodo() {
    const dialogRef = this.dialog.open(TodaysTodoModalComponent, {
      width: '600px',
      height: '400px',
      disableClose: true
    });
    const childComponentInstance = dialogRef.componentInstance as TodaysTodoModalComponent;
    childComponentInstance.emitEvent.subscribe(() => {
      this.successMessage = true;
      this.handleEmitEvent()
      this.createAnalyticChart()
      dialogRef.close();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding any task');
      }
    });
  }

  createLogDeviceChart() {
    if (this.loginChart) {
      this.loginChart.destroy();
    }
    if (this.data) {
      const labels = Object.keys(this.data);
      const values = Object.values(this.data);
      Chart.register(...registerables);
      Chart.register(...registerables);
      this.loginChart = new Chart("loggedDevice", {
        type: 'doughnut',
        data: {
          labels: ['Desktop', 'Andriod', 'Iphone'],
          datasets: [{
            data: [450, 350, 200],
            backgroundColor: [
              'limegreen',
              'rgba(63, 67, 71, 0.7)', // Gray-950 
              'rgba(220, 38, 38, 0.7)', // Red-600 with
            ],
          }]
        },
        options: {
          aspectRatio: 1.5,
        }
      });
    } else {
      console.log("data is null")
    }
  }

  createAnalyticChart() {
    if (this.analyticChart) {
      this.analyticChart.destroy();
    }
    if (this.data) {
      const labels = Object.keys(this.data); // Extract category names
      const values = Object.values(this.data); // Extract values
      Chart.register(...registerables);
      this.analyticChart = new Chart("analyticChart", {
        type: 'line', //this denotes tha type of chart

        data: {// values on X-Axis
          labels: labels,
          datasets: [
            {
              label: "Total",
              data: values,
              backgroundColor: 'limegreen'
            }
          ]
        },
        options: {
          aspectRatio: 1.5,
          responsive: true,
        }
      });
    }
    else {
      console.log("data is undefined")
    }
  }

  createActivityChart() {
    if (this.activityChart) {
      this.activityChart.destroy();
    }
    if (this.data) {
      const labels = Object.keys(this.data);
      const values = Object.values(this.data);
      Chart.register(...registerables);
      this.activityChart = new Chart("activityChart", {
        type: 'bar', //this denotes tha type of chart
        data: {// values on X-Axis
          labels: ['Date', 'Days Spent', 'Total Hours', 'Locations Visited', 'Places Explored', 'Log Count'],
          datasets: [
            {
              label: 'Activity Log',
              data: [10, 5, 20, 8, 15, 50], // Sample numeric data
              backgroundColor: 'rgba(54, 162, 235, 0.2)', // Blue color
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          aspectRatio: 1.5,
          responsive: true,
        }
      });
    }
    else {
      console.log("data is undefined")
    }
  }

}
