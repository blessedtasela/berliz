// notification-list.component.ts
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NotificationSection, Notifications } from 'src/app/models/Notifications.interface';


@Component({
  selector: 'notification-list',
  templateUrl: './notification-list.component.html'
})
export class NotificationListComponent {

  @Input() sections: NotificationSection[] = [];
  @Input() startIndex = 0;
  @Input() endIndex = 0;
  @Input() total = 0;
  @Input() selectAll = false;
  @Input() searchQuery = '';

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() toggleSelectAll = new EventEmitter<void>();
  @Output() bulkAction = new EventEmitter<string>();
  @Output() open = new EventEmitter<Notifications>();
  @Output() toggle = new EventEmitter<Notifications>();

  focusedIndex: number | null = null;

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.sections.length === 0) return;

    const flatList = this.sections.flatMap(g => g.items);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.focusedIndex === null) {
        this.focusedIndex = flatList[0]?.index ?? null;
      } else {
        const currentPos = flatList.findIndex(n => n.index === this.focusedIndex);
        const next = Math.min(currentPos + 1, flatList.length - 1);
        this.focusedIndex = flatList[next]?.index ?? this.focusedIndex;
      }
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.focusedIndex === null) {
        this.focusedIndex = flatList[0]?.index ?? null;
      } else {
        const currentPos = flatList.findIndex(n => n.index === this.focusedIndex);
        const prev = Math.max(currentPos - 1, 0);
        this.focusedIndex = flatList[prev]?.index ?? this.focusedIndex;
      }
    }

    if (event.key === 'Enter' && this.focusedIndex !== null) {
      const n = flatList.find(item => item.index === this.focusedIndex);
      if (n) this.open.emit(n);
    }
  }
}
