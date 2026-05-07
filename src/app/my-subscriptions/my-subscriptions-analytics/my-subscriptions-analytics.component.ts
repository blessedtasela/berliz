import { Component, Input } from '@angular/core';
import { Subscriptions } from 'src/app/models/subscriptions.interface';

@Component({
  selector: 'app-my-subscriptions-analytics',
  templateUrl: './my-subscriptions-analytics.component.html',
  styleUrls: ['./my-subscriptions-analytics.component.css']
})
export class MySubscriptionsAnalyticsComponent {
  @Input() subscriptions: Subscriptions[] = [];

  total = 0;
  active = 0;
  expired = 0;
  expiringSoon = 0;

  ngOnChanges(): void {
    this.total = this.subscriptions.length;
    this.active = this.subscriptions.filter(s => s.status === 'true').length;
    this.expired = this.subscriptions.filter(s => s.status === 'false').length;
    this.expiringSoon = this.subscriptions.filter(s => this.isExpiringSoon(s)).length;
  }

  private isExpiringSoon(sub: Subscriptions): boolean {
    if (!sub.endDate) return false;
    const now = new Date();
    const end = new Date(sub.endDate);
    const diffDays = (end.getTime() - now.getTime()) / 86400000;
    return diffDays > 0 && diffDays <= 7;
  }
}
