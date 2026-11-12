import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { IconsModule } from 'src/app/icons/icons.module';

export interface RequestPersonalizedPlanDialogData {
  trainerName: string;
}

export interface RequestPersonalizedPlanDialogResult {
  description: string;
  proposedSessions: number | null;
  proposedAmount: number;
}

/**
 * BK-34 ext. 4: a client proposes a custom-rate plan to a trainer -- what they want, roughly how
 * many sessions, and what they're offering to pay. The trainer prices it from here (accept at this
 * amount, counter, or decline); nothing is charged until an amount is agreed and the client pays.
 */
@Component({
  selector: 'app-request-personalized-plan-dialog',
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="p-6 flex flex-col gap-4 w-full max-w-sm">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 flex items-center justify-center shrink-0">
          <i-feather name="edit-3" class="text-red-600" style="width:16px;height:16px;"></i-feather>
        </div>
        <div>
          <h2 class="text-sm font-bold text-gray-900 dark:text-gray-100">Request a personalized plan</h2>
          <p class="text-[11px] text-gray-400 dark:text-gray-500">with {{ data.trainerName }}</p>
        </div>
      </div>

      <p class="text-[11px] text-gray-500 dark:text-gray-400">
        Describe what you're asking for and offer an amount. {{ data.trainerName }} can accept it, counter with a
        different price, or decline. You only pay once an amount is agreed.
      </p>

      <div class="flex flex-col gap-1">
        <label class="text-[11px] font-semibold text-gray-600 dark:text-gray-300">What are you asking for?</label>
        <textarea [(ngModel)]="description" rows="3" maxlength="1000" placeholder="e.g. A 3-session plan to get back into training after an injury"
          class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100
                 placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"></textarea>
      </div>

      <div class="flex gap-3">
        <div class="flex flex-col gap-1 flex-1">
          <label class="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Sessions (optional)</label>
          <input type="number" min="1" [(ngModel)]="proposedSessions" placeholder="e.g. 3"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100
                   placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition" />
        </div>
        <div class="flex flex-col gap-1 flex-1">
          <label class="text-[11px] font-semibold text-gray-600 dark:text-gray-300">You're offering (CA$)</label>
          <input type="number" min="1" step="0.01" [(ngModel)]="proposedAmount" placeholder="e.g. 200"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100
                   placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition" />
        </div>
      </div>

      <p *ngIf="error" class="text-[11px] font-semibold text-red-600">{{ error }}</p>

      <div class="flex gap-2 justify-end">
        <button type="button" (click)="cancel()"
          class="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">Cancel</button>
        <button type="button" (click)="submit()"
          class="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition">Send request</button>
      </div>
    </div>
  `
})
export class RequestPersonalizedPlanDialogComponent {
  description = '';
  proposedSessions: number | null = null;
  proposedAmount: number | null = null;
  error = '';

  constructor(
    private dialogRef: MatDialogRef<RequestPersonalizedPlanDialogComponent, RequestPersonalizedPlanDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: RequestPersonalizedPlanDialogData,
  ) { }

  cancel(): void { this.dialogRef.close(undefined); }

  submit(): void {
    const description = this.description.trim();
    if (!description) {
      this.error = 'Describe what you\'re asking for.';
      return;
    }
    if (!this.proposedAmount || this.proposedAmount <= 0) {
      this.error = 'Say how much you\'re offering to pay.';
      return;
    }
    this.dialogRef.close({ description, proposedSessions: this.proposedSessions, proposedAmount: this.proposedAmount });
  }
}
