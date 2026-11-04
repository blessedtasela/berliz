import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { subscriptionEndedText, subscriptionTitle } from '../subscription-status.util';
import { formatDate } from '@angular/common';

@Component({
    selector: 'app-my-subscriptions-expired',
    templateUrl: './my-subscriptions-expired.component.html',
    styleUrls: ['./my-subscriptions-expired.component.css'],
    standalone: false
})
export class MySubscriptionsExpiredComponent {
 @Input() subscription!: Subscriptions;
  @Output() refresh = new EventEmitter<void>();

  get title(): string { return subscriptionTitle(this.subscription); }
  get endedText(): string { return subscriptionEndedText(this.subscription, d => formatDate(d, 'mediumDate', 'en-US')); }
}
