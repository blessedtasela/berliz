import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { BILLING_STORE_LABEL, billingStoreOf } from 'src/app/utils/subscription-billing';

@Component({
    selector: 'app-my-subscriptions-active',
    templateUrl: './my-subscriptions-active.component.html',
    styleUrls: ['./my-subscriptions-active.component.css'],
    standalone: false
})
export class MySubscriptionsActiveComponent {
  @Input() subscription!: Subscriptions;
  @Output() refresh = new EventEmitter<void>();

  /** "App Store" / "Google Play" when the subscription was bought in the mobile app and is billed there, else ''. */
  get storeLabel(): string {
    const store = billingStoreOf(this.subscription);
    return store ? BILLING_STORE_LABEL[store] : '';
  }
}
