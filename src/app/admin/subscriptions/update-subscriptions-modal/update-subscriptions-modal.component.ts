import { Component, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-update-subscriptions-modal',
  templateUrl: './update-subscriptions-modal.component.html',
  styleUrls: ['./update-subscriptions-modal.component.css']
})
export class UpdateSubscriptionsModalComponent {
  onUpdateSubscriptionEmit = new EventEmitter()
}
