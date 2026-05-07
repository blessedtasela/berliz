import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewInit
} from '@angular/core';

@Component({
  selector: 'notification-bulk-actions',
  templateUrl: './notification-bulk-actions.component.html'
})
export class NotificationBulkActionsComponent implements AfterViewInit {

  @Input() selectAll = false;
  @Output() toggleSelectAll = new EventEmitter<void>();
  @Output() bulkAction = new EventEmitter<string>();

  @ViewChild('container') container!: ElementRef;

  menuOpen = false;
  dropdownPosition = 'mt-2'; // default below

  ngAfterViewInit(): void {
    this.calculateDropdownPosition();
    this.subscribeToOutsideClicks();
  };

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
    this.calculateDropdownPosition();
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  onBulk(action: string): void {
    this.bulkAction.emit(action);
    this.menuOpen = false;
  }

  private calculateDropdownPosition(): void {
    if (!this.container) return;

    const rect = this.container.nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;

    // If not enough space below, open upward
    this.dropdownPosition = spaceBelow < 180 ? 'bottom-full mb-2' : 'mt-2';
  }

  subscribeToOutsideClicks(): void {
    document.addEventListener('click', () => {
      this.closeMenu();
    });
  }

}
