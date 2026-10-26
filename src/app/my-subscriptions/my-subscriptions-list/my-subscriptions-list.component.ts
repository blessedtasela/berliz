import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { Router } from '@angular/router';
import { completePaymentLink, subscriptionState } from '../subscription-status.util';

@Component({
    selector: 'app-my-subscriptions-list',
    templateUrl: './my-subscriptions-list.component.html',
    styleUrls: ['./my-subscriptions-list.component.css'],
    standalone: false
})
export class MySubscriptionsListComponent {

  @Input() subscriptions: Subscriptions[] = [];
  @Output() refresh = new EventEmitter<void>();

  private router = inject(Router);

  get active() {
    return this.subscriptions.filter(s => s.status === 'true');
  }

  get expired() {
    return this.subscriptions.filter(s => ['ended', 'cancelled'].includes(subscriptionState(s)));
  }

  /** A checkout that was started and never paid, or a renewal that failed: each needs a next step, not a silent "Expired". */
  get awaitingPayment() {
    return this.subscriptions.filter(s => ['awaiting_payment', 'payment_failed'].includes(subscriptionState(s)));
  }

  isFailed(sub: { status?: string | null }): boolean {
    return subscriptionState(sub) === 'payment_failed';
  }

  canFinishPayment(sub: Subscriptions): boolean {
    return completePaymentLink(sub) !== null;
  }

  finishPayment(sub: Subscriptions): void {
    const link = completePaymentLink(sub);
    if (link) this.router.navigate(link.path, { queryParams: link.query });
  }

  get due() {
    return this.subscriptions.filter(s => this.isDue(s));
  }

  isDue(sub: Subscriptions) {
    if (!sub.endDate) return false;
    const now = new Date();
    const end = new Date(sub.endDate);
    const diffDays = (end.getTime() - now.getTime()) / 86400000;
    return diffDays > 0 && diffDays <= 3;
  }

  onRefresh() {
    this.refresh.emit();
  }

}
