import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerModule } from './partner/partner.module';
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
import { WorkspaceComponent } from './workspace/workspace.component';
import { WorkspaceDetailsComponent } from './workspace-details/workspace-details.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardTopUsersComponent } from './dashboard-top-users/dashboard-top-users.component';
import { DashboardNowActiveComponent } from './dashboard-now-active/dashboard-now-active.component';
import { DashboardActivityChartComponent } from './dashboard-activity-chart/dashboard-activity-chart.component';
import { MainComponent } from './main/main.component';
import { RouterBreadcrumbComponent } from './router-breadcrumb/router-breadcrumb.component';
import { WorkspaceRouteComponent } from './workspace-route/workspace-route.component';



@NgModule({
  declarations: [
    DashboardTodoListComponent,
    DashboardLoginChartComponent,
    DashboardNotificationComponent,
    DashboardActionComponent,
    DashboardAppAnalyticsComponent,
    WorkspaceComponent,
    WorkspaceDetailsComponent,
    DashboardComponent,
    DashboardTopUsersComponent,
    DashboardNowActiveComponent,
    DashboardActivityChartComponent,
    MainComponent,
    RouterBreadcrumbComponent,
    WorkspaceRouteComponent
  ],
  imports: [
    CommonModule,
    PartnerModule,
    TodoListsModule,
    UserModule,
    IconsModule,
    FeatherModule,
    RouterModule,
    NavbarModule,
    FooterModule,
  
  ]
})
export class DashboardModule { }
