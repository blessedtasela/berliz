import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { PeerSessionService } from 'src/app/services/peer-session.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

export interface ProposeSessionModalData {
  participantId: number;
  participantName: string;
}

/**
 * Propose a joint workout session with an existing connection. Deliberately
 * simple — no availability/conflict checking like Booking has, since this is
 * peer-to-peer, not against a provider's schedule.
 */
@Component({
  selector: 'app-propose-session-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule],
  templateUrl: './propose-session-modal.component.html',
  styleUrls: ['./propose-session-modal.component.css']
})
export class ProposeSessionModalComponent {

  form: FormGroup;
  invalidForm = false;
  saving = false;
  readonly minDate = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private peerSessionService: PeerSessionService,
    private snackBar: SnackBarService,
    public dialogRef: MatDialogRef<ProposeSessionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProposeSessionModalData,
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      durationMinutes: [60, Validators.required],
      notes: [''],
    });
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    if (this.saving) return;

    if (this.form.invalid) {
      this.invalidForm = true;
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const scheduledAt = new Date(`${value.date}T${value.time}`);
    if (isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now()) {
      this.snackBar.openSnackBar('Pick a date and time in the future.', 'error');
      return;
    }

    this.invalidForm = false;
    this.saving = true;

    this.peerSessionService.propose({
      participantId: this.data.participantId,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: Number(value.durationMinutes),
      notes: value.notes || undefined,
    }).pipe(take(1)).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.snackBar.openSnackBar(res?.message || 'Session proposed', '');
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.saving = false;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      }
    });
  }
}
