import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscriptions } from 'src/app/models/subscriptions.interface';

@Component({
  selector: 'app-my-subscriptions-expired',
  templateUrl: './my-subscriptions-expired.component.html',
  styleUrls: ['./my-subscriptions-expired.component.css']
})
export class MySubscriptionsExpiredComponent {
 @Input() subscription!: Subscriptions;
  @Output() refresh = new EventEmitter<void>();
}
