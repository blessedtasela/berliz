import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscriptions } from 'src/app/models/subscriptions.interface';

@Component({
    selector: 'app-my-subscriptions-due',
    templateUrl: './my-subscriptions-due.component.html',
    styleUrls: ['./my-subscriptions-due.component.css'],
    standalone: false
})
export class MySubscriptionsDueComponent {
  @Input() subscription!: Subscriptions;
  @Output() refresh = new EventEmitter<void>();
}
