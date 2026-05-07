import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscriptions } from 'src/app/models/subscriptions.interface';

@Component({
  selector: 'app-my-subscriptions-list',
  templateUrl: './my-subscriptions-list.component.html',
  styleUrls: ['./my-subscriptions-list.component.css']
})
export class MySubscriptionsListComponent {

  @Input() subscriptions: Subscriptions[] = [];
  @Output() refresh = new EventEmitter<void>();

  get active() {
    return this.subscriptions.filter(s => s.status === 'true');
  }

  get expired() {
    return this.subscriptions.filter(s => s.status === 'false');
  }

  get due() {
    return this.subscriptions.filter(s => this.isDue(s));
  }

  isDue(sub: Subscriptions) {
    if (!sub.endDate) return false;
    const now = new Date();
    const end = new Date(sub.endDate);
    const diffDays = (end.getTime() - now.getTime()) / 86400000;
    return diffDays > 0 && diffDays <= 3;
  }

  onRefresh() {
    this.refresh.emit();
  }

}
