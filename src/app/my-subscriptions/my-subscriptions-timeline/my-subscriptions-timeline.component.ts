import { Component, Input } from '@angular/core';
import { Subscriptions } from 'src/app/models/subscriptions.interface';

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
