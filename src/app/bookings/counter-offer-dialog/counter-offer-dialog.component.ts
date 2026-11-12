import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { IconsModule } from 'src/app/icons/icons.module';

export interface CounterOfferDialogData {
  clientName: string;
  proposedAmount: number;
}

export interface CounterOfferDialogResult {
  counterAmount: number;
  note: string;
}

/** BK-34 ext. 4: the trainer counters a personalized request with a different amount, and an optional note explaining it. */
@Component({
  selector: 'app-counter-offer-dialog',
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="p-6 flex flex-col gap-4 w-full max-w-sm">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 flex items-center justify-center shrink-0">
          <i-feather name="refresh-cw" class="text-red-600" style="width:16px;height:16px;"></i-feather>
        </div>
        <div>
          <h2 class="text-sm font-bold text-gray-900 dark:text-gray-100">Counter {{ data.clientName }}'s offer</h2>
          <p class="text-[11px] text-gray-400 dark:text-gray-500">They offered {{ data.proposedAmount | currency:'CAD':'symbol':'1.2-2' }}</p>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Your price (CA$)</label>
        <input type="number" min="1" step="0.01" [(ngModel)]="counterAmount" placeholder="e.g. 250"
          class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100
                 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Note (optional)</label>
        <textarea [(ngModel)]="note" rows="2" maxlength="500" placeholder="Why the different price?"
          class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100
                 placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"></textarea>
      </div>

      <p *ngIf="error" class="text-[11px] font-semibold text-red-600">{{ error }}</p>

      <div class="flex gap-2 justify-end">
        <button type="button" (click)="cancel()"
          class="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">Cancel</button>
        <button type="button" (click)="submit()"
          class="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition">Send counter-offer</button>
      </div>
    </div>
  `
})
export class CounterOfferDialogComponent {
  counterAmount: number | null = null;
  note = '';
  error = '';

  constructor(
    private dialogRef: MatDialogRef<CounterOfferDialogComponent, CounterOfferDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: CounterOfferDialogData,
  ) { }

  cancel(): void { this.dialogRef.close(undefined); }

  submit(): void {
    if (!this.counterAmount || this.counterAmount <= 0) {
      this.error = 'Say what you\'re countering with.';
      return;
    }
    this.dialogRef.close({ counterAmount: this.counterAmount, note: this.note.trim() });
  }
}
