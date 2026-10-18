import { Component, EventEmitter, Input, Output } from '@angular/core';

export type InlineAlertKind = 'error' | 'warning' | 'info' | 'success';

/**
 * Persistent, in-context feedback for a form, modal or page section.
 *
 * Use this (not a snackbar) when the message belongs to what the user is looking
 * at and must stay until they fix it or dismiss it: a failed save in a modal, a
 * form-level problem, a page that failed to load. Snackbars are for brief
 * "it worked" confirmations. Errors/warnings are announced as role="alert"
 * (assertive); info/success as role="status" (polite).
 */
@Component({
  selector: 'app-inline-alert',
  templateUrl: './inline-alert.component.html',
  standalone: false,
})
export class InlineAlertComponent {
  @Input() message: string | null | undefined = null;
  @Input() kind: InlineAlertKind = 'error';
  @Input() dismissible = true;
  @Output() dismissed = new EventEmitter<void>();

  get role(): 'alert' | 'status' {
    return this.kind === 'error' || this.kind === 'warning' ? 'alert' : 'status';
  }

  get classes(): string {
    switch (this.kind) {
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200';
      case 'info':
        return 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900 text-sky-800 dark:text-sky-200';
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200';
      default:
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300';
    }
  }

  dismiss(): void {
    this.dismissed.emit();
  }
}
