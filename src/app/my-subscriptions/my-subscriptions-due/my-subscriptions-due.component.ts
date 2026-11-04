import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { subscriptionTitle } from '../subscription-status.util';

@Component({
    selector: 'app-my-subscriptions-due',
    templateUrl: './my-subscriptions-due.component.html',
    styleUrls: ['./my-subscriptions-due.component.css'],
    standalone: false
})
export class MySubscriptionsDueComponent {
  @Input() subscription!: Subscriptions;

  get title(): string { return subscriptionTitle(this.subscription); }
  @Output() refresh = new EventEmitter<void>();
}
