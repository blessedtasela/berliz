import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyNotificationsComponent } from './my-notifications/my-notifications.component';
import { MyNotificationsPageComponent } from './my-notifications-page/my-notifications-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterModule } from '../footer/footer.module';
import { IconsModule } from '../icons/icons.module';
import { NavbarModule } from '../navbar/navbar.module';
import { SearchMyNotificationComponent } from './search-my-notification/search-my-notification.component';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SearchModule } from '../shared/search/search.module';
import { NotificationMainComponent } from './notification-main/notification-main.component';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationEmptyStateComponent } from './notification-empty-state/notification-empty-state.component';
import { NotificationHeaderBarComponent } from './notification-header-bar/notification-header-bar.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';
import { NotificationBulkActionsComponent } from './notification-bulk-actions/notification-bulk-actions.component';
import { NotificationSectionComponent } from './notification-section/notification-section.component';
import { NotificationPaginationComponent } from './notification-pagination/notification-pagination.component';
import { FeatherModule } from 'angular-feather';
import { SharedModule } from '../shared/shared.module';
import { MyNotificationMetricsComponent } from './my-notification-metrics/my-notification-metrics.component';
import { notificationFeatureKey, notificationReducer } from '../state/notification/notification.reducer';
import { StoreModule } from '@ngrx/store';

@NgModule({
  declarations: [
    MyNotificationsComponent,
    MyNotificationsPageComponent,
    SearchMyNotificationComponent,
    NotificationMainComponent,
    NotificationListComponent,
    NotificationEmptyStateComponent,
    NotificationHeaderBarComponent,
    NotificationItemComponent,
    NotificationBulkActionsComponent,
    NotificationSectionComponent,
    NotificationPaginationComponent,
    MyNotificationMetricsComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    NavbarModule,
    FooterModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    SharedModule,
    FeatherModule,
    SearchModule,
  ]
})
export class MyNotificationsModule { }
