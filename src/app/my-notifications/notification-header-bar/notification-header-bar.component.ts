// notification-header-bar.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'notification-header-bar',
  templateUrl: './notification-header-bar.component.html'
})
export class NotificationHeaderBarComponent {
  @Input() startIndex = 0;
  @Input() endIndex = 0;
  @Input() total = 0;
  @Input() selectAll = false;

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() toggleSelectAll = new EventEmitter<void>();
  @Output() bulkAction = new EventEmitter<string>();
}
