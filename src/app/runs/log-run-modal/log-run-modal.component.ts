import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { RunLogRequest, RunLogResponse } from 'src/app/models/run.interface';
import { RunService } from 'src/app/services/run.service';

/**
 * Log a completed run's actual time — duration is the only required field
 * (this is "time stats," not "distance stats"); distance is optional and
 * only unlocks a pace readout on the history page when present. Duration is
 * entered as separate h/m/s fields rather than one seconds input since
 * nobody thinks in raw seconds.
 */
@Component({
  selector: 'app-log-run-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, IconsModule],
  templateUrl: './log-run-modal.component.html',
})
export class LogRunModalComponent implements OnInit {

  title = '';
  ranAt = this.today();
  hours: number | null = null;
  minutes: number | null = null;
  seconds: number | null = null;
  distanceKm: number | null = null;
  notes = '';

  submitting = false;
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { log?: RunLogResponse; runEventId?: number },
    public dialogRef: MatDialogRef<LogRunModalComponent>,
    private runService: RunService,
  ) { }

  ngOnInit(): void {
    if (this.data?.log) {
      const l = this.data.log;
      this.title = l.title ?? '';
      this.ranAt = new Date(l.ranAt).toISOString().slice(0, 10);
      this.hours = Math.floor(l.durationSeconds / 3600) || null;
      this.minutes = Math.floor((l.durationSeconds % 3600) / 60);
      this.seconds = l.durationSeconds % 60;
      this.distanceKm = l.distanceKm;
      this.notes = l.notes ?? '';
    }
  }

  get isEdit(): boolean {
    return !!this.data?.log?.id;
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private get totalSeconds(): number {
    return (this.hours ?? 0) * 3600 + (this.minutes ?? 0) * 60 + (this.seconds ?? 0);
  }

  get canSubmit(): boolean {
    return !this.submitting && !!this.ranAt && this.totalSeconds > 0;
  }

  save(): void {
    if (!this.canSubmit) {
      this.error = 'Enter a duration greater than zero.';
      return;
    }

    this.error = null;
    this.submitting = true;

    const request: RunLogRequest = {
      id: this.data?.log?.id,
      runEventId: this.data?.log?.runEventId ?? this.data?.runEventId ?? null,
      title: this.title.trim() || null,
      ranAt: new Date(this.ranAt).toISOString(),
      durationSeconds: this.totalSeconds,
      distanceKm: this.distanceKm,
      notes: this.notes.trim() || null,
    };

    const request$ = this.isEdit ? this.runService.updateRunLog(request) : this.runService.logRun(request);

    request$.pipe(take(1)).subscribe({
      next: () => {
        this.submitting = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.message || 'Could not save this run. Please try again.';
      },
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
