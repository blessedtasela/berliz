// notification-pagination.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'notification-pagination',
  templateUrl: './notification-pagination.component.html'
})
export class NotificationPaginationComponent {
  @Input() startIndex = 0;
  @Input() endIndex = 0;
  @Input() total = 0;

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
}
