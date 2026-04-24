// notification-section.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Notifications } from 'src/app/models/Notifications.interface';

@Component({
  selector: 'notification-section',
  templateUrl: './notification-section.component.html'
})
export class NotificationSectionComponent {
  @Input() title = '';
  @Input() searchQuery = '';
  @Input() items: (Notifications & { index: number })[] = [];

  @Output() open = new EventEmitter<Notifications>();
  @Output() toggle = new EventEmitter<Notifications>();

}
