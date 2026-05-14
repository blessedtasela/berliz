import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  HostListener
} from '@angular/core';
import { Notifications } from 'src/app/models/Notifications.interface';

@Component({
  selector: 'notification-item',
  templateUrl: './notification-item.component.html'
})
export class NotificationItemComponent implements OnChanges {

  @Input() item!: Notifications;
  @Input() searchQuery = '';
  @Input() selectionMode: boolean = false;

  @Output() open = new EventEmitter<Notifications>();
  @Output() toggle = new EventEmitter<Notifications>();
  @Output() markRead = new EventEmitter<Notifications>();
  @Output() markUnread = new EventEmitter<Notifications>();
  @Output() deleteItem = new EventEmitter<Notifications>();

  menuOpen = false;
  pressTimer: any;
  private longPressTriggered = false;

  static activeMenu: NotificationItemComponent | null = null;

  constructor() { }

  // -----------------------------------
  // LIFECYCLE
  // -----------------------------------
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectionMode'] && this.selectionMode) {
      this.menuOpen = false;
    }
  }

  ngAfterViewInit() {

  }

  subscribeToOutsideClicks() {
    this.menuOpen = false;
  }

  // -----------------------------------
  // OUTSIDE CLICK (Angular-safe)
  // -----------------------------------
  @HostListener('document:click')
  handleOutsideClick() {
    if (!this.selectionMode) {
      this.menuOpen = false;
    }
  }

  // -----------------------------------
  // CLICK
  // -----------------------------------

  onToggleClick(event: MouseEvent) {
    event.stopPropagation();
    this.toggle.emit(this.item);
  }

  onItemClick(event: MouseEvent): void {
    event.stopPropagation();

    this.cancelPress();

    // prevent open after long press
    if (this.longPressTriggered) {
      this.longPressTriggered = false;
      return;
    }

    if (this.selectionMode) {
      this.toggle.emit(this.item);
      return;
    }

    this.open.emit(this.item);
  }
  // ---------------------------------------------------------
  // LONG PRESS
  // ---------------------------------------------------------

  startPress(event: MouseEvent): void {
    if (this.selectionMode) return;

    this.longPressTriggered = false;

    this.pressTimer = setTimeout(() => {
      this.longPressTriggered = true;
      this.toggle.emit(this.item);
    }, 1000);
  }

  cancelPress() {
    clearTimeout(this.pressTimer);
  }

  // -----------------------------------
  // MENU
  // -----------------------------------
  toggleMenu(event: MouseEvent) {
    event.stopPropagation();

    if (this.selectionMode) return;

    // close previously opened menu
    if (
      NotificationItemComponent.activeMenu &&
      NotificationItemComponent.activeMenu !== this
    ) {
      NotificationItemComponent.activeMenu.menuOpen = false;
    }

    // toggle current menu
    this.menuOpen = !this.menuOpen;

    // register current menu
    NotificationItemComponent.activeMenu =
      this.menuOpen ? this : null;
  }

  markAsRead(event: MouseEvent) {
    if (this.selectionMode) return;

    event.stopPropagation();
    this.markRead.emit(this.item);
    this.menuOpen = false;
  }

  markAsUnread(event: MouseEvent) {
    if (this.selectionMode) return;

    event.stopPropagation();
    this.markUnread.emit(this.item);
    this.menuOpen = false;
  }

  delete(event: MouseEvent) {
    if (this.selectionMode) return;

    event.stopPropagation();
    this.deleteItem.emit(this.item);
    this.menuOpen = false;
  }

  // -----------------------------------
  // META
  // -----------------------------------
  get meta() {
    const text = (this.item.notification || '').toLowerCase();

    if (text.includes('cancelled')) {
      return { icon: 'x-circle', color: 'text-red-600' };
    }
    if (text.includes('completed')) {
      return { icon: 'check-circle', color: 'text-green-600' };
    }
    if (text.includes('pending')) {
      return { icon: 'clock', color: 'text-blue-500' };
    }
    if (text.includes('added')) {
      return { icon: 'plus-circle', color: 'text-blue-600' };
    }
    return { icon: 'bell', color: 'text-gray-500' };
  }

  highlight(text: string, query: string): string {
    if (!query) return text;

    const words = query
      .split(/\s+/)
      .filter(w => w.trim().length > 0)
      .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    const regex = new RegExp(words.join('|'), 'gi');

    return text.replace(regex, match =>
      `<span class="text-red-600 font-semibold">${match}</span>`
    );
  }
}