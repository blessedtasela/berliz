// notification-item.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Notifications } from 'src/app/models/Notifications.interface';

@Component({
  selector: 'notification-item',
  templateUrl: './notification-item.component.html'
})
export class NotificationItemComponent {
  @Input() item!: Notifications;
  @Input() searchQuery: string = '';

  @Output() open = new EventEmitter<Notifications>();
  @Output() toggle = new EventEmitter<Notifications>();

  get meta() {
    const text = (this.item.notification || '').toLowerCase();

    if (text.includes('cancelled')) {
      return { icon: 'x-circle', color: 'text-red-600', label: 'Cancelled' };
    }
    if (text.includes('completed')) {
      return { icon: 'check-circle', color: 'text-green-600', label: 'Completed' };
    }
    if (text.includes('pending')) {
      return { icon: 'clock', color: 'text-amber-500', label: 'Pending' };
    }
    if (text.includes('added') || text.includes('set a todo') || text.includes('have added')) {
      return { icon: 'plus-circle', color: 'text-blue-600', label: 'New todo' };
    }
    if (text.includes('update')) {
      return { icon: 'edit-3', color: 'text-purple-600', label: 'Updated' };
    }
    return { icon: 'bell', color: 'text-gray-500', label: 'Notification' };
  }

  highlight(text: string, query: string): string {
  if (!query) return text;

  // Split into words, escape regex chars
  const words = query
    .split(/\s+/)
    .filter(w => w.trim().length > 0)
    .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (words.length === 0) return text;

  const regex = new RegExp(words.join('|'), 'gi');

  return text.replace(regex, match =>
    `<span class="text-red-600 font-semibold">${match}</span>`
  );
}

}
