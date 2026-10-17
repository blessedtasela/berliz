import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface RefundDialogData {
  /** Who/what the payment is, for the heading, e.g. "sam@example.com". */
  who: string;
  /** What can still be refunded, in dollars. */
  refundable: number;
  /** What has already been refunded, in dollars. */
  alreadyRefunded: number;
  currency?: string | null;
}

/** What the dialog resolves with: `null` = everything that is left, a number = that part, `undefined` = cancelled. */
export type RefundDialogResult = number | null | undefined;

/**
 * Asks the admin how much of a payment to refund: all of what is left (the default), or any amount up to it.
 * Replaces the old all-or-nothing confirmation.
 */
@Component({
  selector: 'app-refund-dialog',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-5 flex flex-col gap-4 font-sans min-w-[18rem] max-w-md">
      <div>
        <h2 class="text-sm font-bold text-gray-900 dark:text-gray-100">Refund payment</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          To {{ data.who }}. {{ money(data.refundable) }} can still be refunded<span *ngIf="data.alreadyRefunded > 0">
          ({{ money(data.alreadyRefunded) }} was already refunded)</span>. This goes back to their card through Stripe and can't be undone.
        </p>
      </div>

      <div class="flex gap-2">
        <button type="button" (click)="mode = 'full'" [attr.aria-pressed]="mode === 'full'"
          class="flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition"
          [ngClass]="mode === 'full' ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'">
          Refund all ({{ money(data.refundable) }})
        </button>
        <button type="button" (click)="mode = 'part'" [attr.aria-pressed]="mode === 'part'"
          class="flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition"
          [ngClass]="mode === 'part' ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'">
          Part of it
        </button>
      </div>

      <label *ngIf="mode === 'part'" class="flex flex-col gap-1">
        <span class="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Amount to refund</span>
        <input type="number" min="0.01" [max]="data.refundable" step="0.01" [(ngModel)]="amount" aria-label="Amount to refund"
          class="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100
                 focus:outline-none focus:ring-2 focus:ring-red-500" />
        <span *ngIf="error" role="alert" class="text-[11px] text-red-600 dark:text-red-400">{{ error }}</span>
      </label>

      <div class="flex justify-end gap-2">
        <button type="button" (click)="ref.close(undefined)" class="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">Cancel</button>
        <button type="button" (click)="confirm()" class="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700">
          Refund {{ mode === 'full' ? money(data.refundable) : (valid ? money(+amount!) : '') }}
        </button>
      </div>
    </div>
  `,
})
export class RefundDialogComponent {
  mode: 'full' | 'part' = 'full';
  amount: number | null = null;
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: RefundDialogData,
    public ref: MatDialogRef<RefundDialogComponent, RefundDialogResult>,
  ) { }

  money(value: number): string {
    return `${(this.data.currency || 'USD').toUpperCase() === 'USD' ? '$' : ''}${value.toFixed(2)}${(this.data.currency || 'USD').toUpperCase() === 'USD' ? '' : ' ' + this.data.currency}`;
  }

  get valid(): boolean {
    const n = Number(this.amount);
    return this.amount !== null && Number.isFinite(n) && n > 0 && n <= this.data.refundable + 1e-9;
  }

  confirm(): void {
    if (this.mode === 'full') {
      this.ref.close(null);
      return;
    }
    if (!this.valid) {
      this.error = `Enter an amount between 0.01 and ${this.data.refundable.toFixed(2)}.`;
      return;
    }
    // A "part" that equals everything left is the same as refunding it all.
    const n = Math.round(Number(this.amount) * 100) / 100;
    this.ref.close(n >= this.data.refundable - 1e-9 ? null : n);
  }
}
