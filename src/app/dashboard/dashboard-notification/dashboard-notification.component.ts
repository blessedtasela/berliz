import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Notifications } from 'src/app/models/Notifications.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { NotificationDetailsComponent } from 'src/app/shared/notification-details/notification-details.component';
import { TimeAgoPipe } from 'src/app/shared/pipes/time-ago.pipe';
import { NotificationService } from 'src/app/services/notification.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Store } from '@ngrx/store';
import { selectMyNotifications } from 'src/app/state/notification/notification.selector';
import { loadMyNotifications } from 'src/app/state/notification/notification.actions';

@Component({
  selector: 'app-dashboard-notification',
  templateUrl: './dashboard-notification.component.html',
  styleUrls: ['./dashboard-notification.component.css']
})
export class DashboardNotificationComponent implements OnInit, OnDestroy {

  notifications: Notifications[] = [];
  allNotifications: Notifications[] = [];
  subscriptions: Subscription[] = [];

  constructor(
    private rxStompService: RxStompService,
    private store: Store,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private snackbarService: SnackBarService
  ) { }

  // No auth check here: this component only ever mounts inside
  // DashboardMainComponent, itself only reachable via AppComponent's
  // 'sidebar' layout branch -- already gated on auth (see
  // AppComponent#updateLayout). A redundant one-time check here previously
  // meant that if it ever ran during a momentary unauthenticated flash, this
  // component silently never loaded any notifications for the rest of the
  // session.
  ngOnInit(): void {
    this.loadInitialNotifications();
    this.watchNotificationEvents();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  formatDate(dateString: any): string {
    return new Date(dateString).toDateString();
  }

  private updateNotificationList() {
    this.notifications = this.notifications
      .filter(n => !n.read)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 12);
  }

  private loadInitialNotifications() {
    this.store.dispatch(loadMyNotifications());
    const sub = this.store.select(selectMyNotifications).subscribe(data => {
      this.notifications = data || [];
      this.allNotifications = data || [];
      this.updateNotificationList();
    });

    this.subscriptions.push(sub);
  }

  private watchNotificationEvents() {
    const topics = [
      { topic: '/topic/newNotification', type: 'new' },
      { topic: '/topic/updateNotification', type: 'update' },
      { topic: '/topic/deleteNotification', type: 'delete' }
    ];

    topics.forEach(t => {
      const sub = this.rxStompService.watch(t.topic).subscribe(message => {
        const received: Notifications = JSON.parse(message.body);
        this.handleNotificationEvent(t.type as any, received);
      });

      this.subscriptions.push(sub);
    });
  }

  private handleNotificationEvent(type: 'new' | 'update' | 'delete', received: Notifications) {
    switch (type) {
      case 'new':
        this.notifications.push(received);
        break;

      case 'update':
        const index = this.notifications.findIndex(n => n.id === received.id);
        if (index !== -1) this.notifications[index] = received;
        break;

      case 'delete':
        this.notifications = this.notifications.filter(n => n.id !== received.id);
        break;
    }

    this.updateNotificationList();
  }

  /** Open modal + mark as read */
  openNotificationModal(n: Notifications) {
    const dialogRef = this.dialog.open(NotificationDetailsComponent, {
      width: 'auto',
      maxWidth: '90vw',
      maxHeight: '90vh',
      autoFocus: false,
      data: n,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.markAsRead(n);
    });
  }

  private markAsRead(n: Notifications) {
    // Optimistic UI update
    n.read = true;
    const originalList = [...this.notifications];

    // Remove from UI immediately
    this.notifications = this.notifications.filter(x => x.id !== n.id);

    // Call backend
    this.notificationService.markAsRead(n.id).subscribe({
      next: () => {
        // Notify backend via WebSocket
        this.rxStompService.publish({
          destination: '/app/markNotificationRead',
          body: JSON.stringify({ id: n.id })
        });

        // Refresh unread count or list
        this.updateNotificationList();
      },
      error: () => {
        // Revert UI if backend fails
        this.notifications = originalList;
        n.read = false;

        this.snackbarService.openSnackBar('Failed to mark notification as read.', 'error');
      }
    });
  }

  get totalCount(): number {
    return this.allNotifications.length;
  }

  get unreadCount(): number {
    return this.allNotifications.filter(n => !n.read).length;
  }

  get readCount(): number {
    return this.allNotifications.filter(n => n.read).length;
  }
}