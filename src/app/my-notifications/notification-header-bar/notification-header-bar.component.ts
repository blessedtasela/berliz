// notification-header-bar.component.ts
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'notification-header-bar',
  templateUrl: './notification-header-bar.component.html'
})
export class NotificationHeaderBarComponent {
  @Input() startIndex = 0;
  @Input() endIndex = 0;
  @Input() total = 0;
  @Input() selectAll = false;
  @Input() refreshing = false;

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() toggleSelectAll = new EventEmitter<void>();
  @Output() bulkAction = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();

  menuOpen = false;

  constructor() { }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  doBulk(action: string) {
    this.bulkAction.emit(action);
    this.menuOpen = false;
  }

  @HostListener('document:click')
  handleOutsideClick() {
    this.menuOpen = false;
  }
}
