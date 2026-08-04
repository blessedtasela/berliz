import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { Notifications } from 'src/app/models/Notifications.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { NotificationDetailsComponent } from 'src/app/shared/notification-details/notification-details.component';
import { selectMyNotifications } from 'src/app/state/notification/notification.selector';

@Component({
  selector: 'notification-dropdown-component',
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.css']
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {

  notifications: Notifications[] = [];
  subscriptions: Subscription[] = [];
  @Output() close = new EventEmitter<void>();

  visibleCount = 10;
  maxVisible = 50;

  constructor(
    private store: Store,
    private rxStompService: RxStompService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadInitialNotifications();
    this.watchNotificationEvents();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadInitialNotifications() {
    const sub = this.store.select(selectMyNotifications).subscribe(data => {
      this.notifications = (data || [])
        .filter(n => !n.read)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
        this.notifications.unshift(received);
        break;
      case 'update':
        const index = this.notifications.findIndex(n => n.id === received.id);
        if (index !== -1) this.notifications[index] = received;
        break;
      case 'delete':
        this.notifications = this.notifications.filter(n => n.id !== received.id);
        break;
    }

    this.notifications = this.notifications.filter(n => !n.read);
  }

  loadMore() {
    this.visibleCount = Math.min(this.visibleCount + 10, this.maxVisible);
  }

  openNotification(n: Notifications) {
    this.rxStompService.publish({
      destination: '/app/markNotificationRead',
      body: JSON.stringify({ id: n.id })
    });

    n.read = true;
    this.notifications = this.notifications.filter(x => !x.read);

    this.dialog.open(NotificationDetailsComponent, {
      width: '450px',
      data: n,
      panelClass: 'berliz-modal'
    });
  }

  goToAllNotifications() {
    this.router.navigate(['/dashboard/my-notifications']);
  }
}