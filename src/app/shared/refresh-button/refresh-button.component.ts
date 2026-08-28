import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Small icon button for dashboard list/detail pages to re-run their own data
 * load without a full page refresh. Purely presentational — the consuming
 * page owns what "refresh" actually means (re-dispatching its NgRx load
 * action, refetching via a service call, etc.) and passes `loading` back in
 * so the icon can spin while that's in flight.
 */
@Component({
  selector: 'app-refresh-button',
  templateUrl: './refresh-button.component.html',
})
export class RefreshButtonComponent {
  @Input() loading = false;
  @Input() title = 'Refresh';
  @Output() refresh = new EventEmitter<void>();

  onClick(): void {
    if (!this.loading) this.refresh.emit();
  }
}
