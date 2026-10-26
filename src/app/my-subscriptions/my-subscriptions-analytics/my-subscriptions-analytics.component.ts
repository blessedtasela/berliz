import { Component, Input } from '@angular/core';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { subscriptionState } from '../subscription-status.util';

@Component({
    selector: 'app-my-subscriptions-analytics',
    templateUrl: './my-subscriptions-analytics.component.html',
    styleUrls: ['./my-subscriptions-analytics.component.css'],
    standalone: false
})
export class MySubscriptionsAnalyticsComponent {
  @Input() subscriptions: Subscriptions[] = [];

  total = 0;
  active = 0;
  expired = 0;
  expiringSoon = 0;
  /** Checkouts started but not paid (and renewals that failed): counted so the tiles add up to the rows below. */
  awaitingPayment = 0;

  ngOnChanges(): void {
    this.total = this.subscriptions.length;
    this.active = this.subscriptions.filter(s => s.status === 'true').length;
    this.expired = this.subscriptions.filter(s => ['ended', 'cancelled'].includes(subscriptionState(s))).length;
    this.awaitingPayment = this.subscriptions.filter(s => ['awaiting_payment', 'payment_failed'].includes(subscriptionState(s))).length;
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
