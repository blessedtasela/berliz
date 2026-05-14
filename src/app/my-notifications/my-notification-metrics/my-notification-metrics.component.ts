import { Component, Input } from '@angular/core';
import { Notifications } from 'src/app/models/Notifications.interface';

@Component({
  selector: 'app-my-notification-metrics',
  templateUrl: './my-notification-metrics.component.html',
  styleUrls: ['./my-notification-metrics.component.css']
})
export class MyNotificationMetricsComponent {
  @Input() notifications: Notifications[] = [];

  get total(): number {
    return this.notifications.length;
  }

  get read(): number {
    return this.notifications.filter(n => n.read === true).length;
  }

  get unread(): number {
    return this.notifications.filter(n => n.read === false).length;
  }

  get recent(): number {
    const now = Date.now();
    return this.notifications.filter(n => {
      const diff = now - new Date(n.date).getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000; // Last 7 days
    }).length;
  }
}
