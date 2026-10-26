import { Component, Input } from '@angular/core';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { subscriptionState, subscriptionStatusClasses, subscriptionStatusLabel } from '../subscription-status.util';

@Component({
    selector: 'app-my-subscriptions-timeline',
    templateUrl: './my-subscriptions-timeline.component.html',
    styleUrls: ['./my-subscriptions-timeline.component.css'],
    standalone: false
})
export class MySubscriptionsTimelineComponent {
 @Input() subscriptions: Subscriptions[] = [];

  // Cached per input array: a getter that returned a fresh array on every change-detection pass made *ngFor re-diff each time.
  private sortedFrom: Subscriptions[] | null = null;
  private sortedCache: Subscriptions[] = [];

  statusLabel = subscriptionStatusLabel;
  statusClasses = subscriptionStatusClasses;

  isActive(sub: Subscriptions): boolean {
    return subscriptionState(sub) === 'active';
  }

  isAwaiting(sub: Subscriptions): boolean {
    return subscriptionState(sub) === 'awaiting_payment';
  }

  /** "Ongoing" is only true of an active plan with no end date; an unpaid one has not started. */
  rangeEnd(sub: Subscriptions): string {
    return this.isActive(sub) ? 'Ongoing' : 'not started';
  }

  get sorted() {
    if (this.sortedFrom !== this.subscriptions) {
      this.sortedFrom = this.subscriptions;
      this.sortedCache = [...this.subscriptions].sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    }
    return this.sortedCache;
  }
}
