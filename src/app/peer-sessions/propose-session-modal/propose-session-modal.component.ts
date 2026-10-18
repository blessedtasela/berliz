import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { PeerSessionService } from 'src/app/services/peer-session.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { DateStripComponent } from 'src/app/shared/date-strip/date-strip.component';
import { TimePickerComponent } from 'src/app/shared/time-picker/time-picker.component';
import { SharedModule } from 'src/app/shared/shared.module';
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
    imports: [CommonModule, ReactiveFormsModule, IconsModule, SharedModule, DateStripComponent, TimePickerComponent],
    templateUrl: './propose-session-modal.component.html',
    styleUrls: ['./propose-session-modal.component.css']
})
export class ProposeSessionModalComponent {

  form: FormGroup;
  invalidForm = false;
  saving = false;
  /** Inline message above the submit button: validation problems and failed proposals. */
  submitError: string | null = null;

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
    this.submitError = null;

    if (this.form.invalid) {
      this.invalidForm = true;
      this.form.markAllAsTouched();
      this.submitError = 'Pick a date, a time and a duration before proposing the session.';
      return;
    }

    const value = this.form.value;
    const scheduledAt = new Date(`${value.date}T${value.time}`);
    if (isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now()) {
      this.submitError = 'Pick a date and time in the future.';
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
        this.snackBar.openSnackBar(res?.message || `Session proposed to ${this.data.participantName}`, '');
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.saving = false;
        this.submitError = err?.error?.message || genericError;
      }
    });
  }
}
