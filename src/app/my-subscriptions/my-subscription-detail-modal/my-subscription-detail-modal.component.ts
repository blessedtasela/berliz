import { Component, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-my-subscription-detail-modal',
  templateUrl: './my-subscription-detail-modal.component.html',
  styleUrls: ['./my-subscription-detail-modal.component.css']
})
export class MySubscriptionDetailModalComponent {
  emitEvent = new EventEmitter()
}
