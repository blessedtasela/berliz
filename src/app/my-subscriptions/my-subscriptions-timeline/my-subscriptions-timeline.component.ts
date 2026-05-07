import { Component, Input } from '@angular/core';
import { Subscriptions } from 'src/app/models/subscriptions.interface';

@Component({
  selector: 'app-my-subscriptions-timeline',
  templateUrl: './my-subscriptions-timeline.component.html',
  styleUrls: ['./my-subscriptions-timeline.component.css']
})
export class MySubscriptionsTimelineComponent {
 @Input() subscriptions: Subscriptions[] = [];

  get sorted() {
    return [...this.subscriptions].sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }
}
