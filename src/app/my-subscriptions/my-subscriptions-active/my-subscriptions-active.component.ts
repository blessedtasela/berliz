import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscriptions } from 'src/app/models/subscriptions.interface';

@Component({
  selector: 'app-my-subscriptions-active',
  templateUrl: './my-subscriptions-active.component.html',
  styleUrls: ['./my-subscriptions-active.component.css']
})
export class MySubscriptionsActiveComponent {
  @Input() subscription!: Subscriptions;
  @Output() refresh = new EventEmitter<void>();
}
