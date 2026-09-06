import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { RunEventRequest, RunEventResponse } from 'src/app/models/run.interface';
import { RunService } from 'src/app/services/run.service';

/**
 * Schedule (or edit) a run — solo is just a personal plan; a group run asks
 * for a city (so it can be found — see RunsComponent's Discover tab) and
 * whether it's open for anyone to request to join, or invite-only (the
 * creator invites specific connections from the My Runs tab afterward).
 */
@Component({
  selector: 'app-create-run-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, IconsModule],
  templateUrl: './create-run-modal.component.html',
})
export class CreateRunModalComponent implements OnInit {

  title = '';
  city = '';
  scheduledAt = this.defaultDateTime();
  notes = '';
  solo = true;
  isPublic = true;
  maxParticipants: number | null = null;

  submitting = false;
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { event?: RunEventResponse; defaultCity?: string },
    public dialogRef: MatDialogRef<CreateRunModalComponent>,
    private runService: RunService,
  ) { }

  ngOnInit(): void {
    if (this.data?.event) {
      const e = this.data.event;
      this.title = e.title ?? '';
      this.city = e.city ?? '';
      this.scheduledAt = new Date(e.scheduledAt).toISOString().slice(0, 16);
      this.notes = e.notes ?? '';
      this.solo = e.solo;
      this.isPublic = e.isPublic;
      this.maxParticipants = e.maxParticipants;
    } else if (this.data?.defaultCity) {
      this.city = this.data.defaultCity;
      this.solo = false;
    }
  }

  get isEdit(): boolean {
    return !!this.data?.event?.id;
  }

  private defaultDateTime(): string {
    const d = new Date(Date.now() + 60 * 60 * 1000); // an hour from now, a sane default
    d.setMinutes(0, 0, 0);
    return d.toISOString().slice(0, 16);
  }

  get canSubmit(): boolean {
    if (this.submitting || !this.scheduledAt) return false;
    return this.solo || this.city.trim().length > 0;
  }

  save(): void {
    if (!this.canSubmit) {
      this.error = 'A group run needs a city so other runners can find it.';
      return;
    }

    this.error = null;
    this.submitting = true;

    const request: RunEventRequest = {
      id: this.data?.event?.id,
      title: this.title.trim() || null,
      city: this.solo ? null : this.city.trim(),
      scheduledAt: new Date(this.scheduledAt).toISOString(),
      notes: this.notes.trim() || null,
      solo: this.solo,
      isPublic: this.solo ? false : this.isPublic,
      maxParticipants: this.solo ? null : this.maxParticipants,
    };

    const request$ = this.isEdit ? this.runService.updateRunEvent(request) : this.runService.createRunEvent(request);

    request$.pipe(take(1)).subscribe({
      next: (res) => {
        this.submitting = false;
        this.dialogRef.close(res?.data ?? true);
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
