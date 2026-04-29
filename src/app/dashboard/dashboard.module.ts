import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserModule } from './user/user.module';
import { IconsModule } from '../icons/icons.module';
import { FeatherModule } from 'angular-feather';
import { RouterModule } from '@angular/router';
import { NavbarModule } from '../navbar/navbar.module';
import { FooterModule } from '../footer/footer.module';
import { DashboardTodoListComponent } from './dashboard-todo-list/dashboard-todo-list.component';
import { DashboardLoginChartComponent } from './dashboard-login-chart/dashboard-login-chart.component';
import { DashboardNotificationComponent } from './dashboard-notification/dashboard-notification.component';
import { DashboardActionComponent } from './dashboard-action/dashboard-action.component';
import { DashboardAppAnalyticsComponent } from './dashboard-app-analytics/dashboard-app-analytics.component';
import { TodoListsModule } from './todo-lists/todo-lists.module';
import { DashboardTopUsersComponent } from './dashboard-top-users/dashboard-top-users.component';
import { DashboardNowActiveComponent } from './dashboard-now-active/dashboard-now-active.component';
import { DashboardActivityChartComponent } from './dashboard-activity-chart/dashboard-activity-chart.component';
import { TodaysTodoModalComponent } from './todays-todo-modal/todays-todo-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { DashboardMainComponent } from './dashboard-main/dashboard-main.component';
import { DashboardRouteComponent } from './dashboard-route/dashboard-route.component';



@NgModule({
  declarations: [
    DashboardTodoListComponent,
    DashboardLoginChartComponent,
    DashboardNotificationComponent,
    DashboardActionComponent,
    DashboardAppAnalyticsComponent,
    DashboardTopUsersComponent,
    DashboardNowActiveComponent,
    DashboardActivityChartComponent,
    TodaysTodoModalComponent,
    DashboardMainComponent,
    DashboardRouteComponent
  ],
  imports: [
    CommonModule,
    TodoListsModule,
    UserModule,
    IconsModule,
    FeatherModule,
    RouterModule,
    NavbarModule,
    FooterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class DashboardModule { }
