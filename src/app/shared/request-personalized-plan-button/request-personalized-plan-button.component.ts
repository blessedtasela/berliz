import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { IconsModule } from 'src/app/icons/icons.module';
import { PersonalizedRequestService } from 'src/app/services/personalized-request.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import {
  RequestPersonalizedPlanDialogComponent,
  RequestPersonalizedPlanDialogResult,
} from 'src/app/booking/request-personalized-plan-dialog/request-personalized-plan-dialog.component';

/**
 * BK-34 ext. 4 — a secondary action next to "Book a session" on a trainer's profile: ask for a
 * custom-priced plan instead of booking an ordinary session. Trainers only (centers aren't part
 * of this feature); renders nothing otherwise.
 */
@Component({
  selector: 'app-request-personalized-plan-button',
  imports: [CommonModule, IconsModule, MatDialogModule],
  template: `
    <button *ngIf="canRequest" type="button" (click)="open()" [disabled]="busy"
      class="inline-flex items-center gap-1.5 font-semibold rounded-lg transition px-2.5 py-1 text-[11px]
             bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300
             hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60">
      <i-feather name="edit-3" style="width:12px;height:12px;"></i-feather>
      Request a personalized plan
    </button>
  `
})
export class RequestPersonalizedPlanButtonComponent {
  @Input() role: string | null | undefined = null;
  @Input() trainerId: number | null | undefined = null;
  @Input() trainerName = 'this trainer';

  busy = false;

  constructor(
    private dialog: MatDialog,
    private personalizedRequestService: PersonalizedRequestService,
    private snackBar: SnackBarService,
  ) { }

  get canRequest(): boolean {
    return (this.role || '').toLowerCase() === 'trainer' && !!this.trainerId;
  }

  open(): void {
    if (!this.trainerId || this.busy) return;
    this.dialog.open<RequestPersonalizedPlanDialogComponent, unknown, RequestPersonalizedPlanDialogResult>(
      RequestPersonalizedPlanDialogComponent,
      { width: '420px', maxWidth: '95vw', data: { trainerName: this.trainerName } },
    ).afterClosed().subscribe(result => {
      if (!result) return; // cancelled
      this.busy = true;
      this.personalizedRequestService.submit(this.trainerId!, result.description, result.proposedSessions, result.proposedAmount)
        .subscribe({
          next: res => {
            this.busy = false;
            this.snackBar.openSnackBar(res?.data?.message || res?.message || 'Your request was sent.', '');
          },
          error: err => {
            this.busy = false;
            this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
          },
        });
    });
  }
}
