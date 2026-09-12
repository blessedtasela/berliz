import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AvailabilityService } from 'src/app/services/availability.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { DAY_NAMES_SHORT } from 'src/app/models/availability.model';
import { genericError } from 'src/validators/form-validators.module';

interface DayRow {
  dayOfWeek: number;
  name: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
  invalid: boolean;
}

/**
 * Admin-only weekly schedule editor for a SPECIFIC trainer or center, opened
 * from that provider's admin detail/list page. Mirrors
 * MyAvailabilityEditorComponent's day-grid UI, but targets an explicit
 * trainerId/centerId via the admin-only setProviderAvailability endpoint
 * instead of "mine" — so it doesn't go through NgRx (no shared state to
 * keep in sync, this is a one-off admin action on someone else's schedule).
 */
@Component({
  selector: 'app-admin-availability-modal',
  templateUrl: './admin-availability-modal.component.html',
  styleUrls: ['./admin-availability-modal.component.css']
})
export class AdminAvailabilityModalComponent implements OnInit {
  onUpdateEmit = new EventEmitter();

  trainerId?: number;
  centerId?: number;
  providerName: string;

  days: DayRow[] = this.buildDefaultDays();
  loading = true;
  saving = false;

  constructor(
    public dialogRef: MatDialogRef<AdminAvailabilityModalComponent>,
    private availabilityService: AvailabilityService,
    private snackBar: SnackBarService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.trainerId = this.data?.trainerId;
    this.centerId = this.data?.centerId;
    this.providerName = this.data?.name || '';
  }

  ngOnInit(): void {
    this.availabilityService.getProviderAvailability(this.trainerId, this.centerId)
      .subscribe({
        next: response => {
          const rows = response?.data ?? [];
          if (rows.length > 0) {
            this.days = this.buildDefaultDays().map(defaultDay => {
              const match = rows.find(r => r.dayOfWeek === defaultDay.dayOfWeek);
              if (!match) return defaultDay;
              return {
                ...defaultDay,
                isActive: !!match.isActive,
                startTime: (match.startTime || defaultDay.startTime).slice(0, 5),
                endTime: (match.endTime || defaultDay.endTime).slice(0, 5),
              };
            });
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.openSnackBar(genericError, 'error');
        }
      });
  }

  private buildDefaultDays(): DayRow[] {
    return DAY_NAMES_SHORT.map((name, dayOfWeek) => ({
      dayOfWeek,
      name,
      isActive: false,
      startTime: '09:00',
      endTime: '17:00',
      invalid: false,
    }));
  }

  toggleDay(day: DayRow): void {
    day.isActive = !day.isActive;
    day.invalid = false;
  }

  get activeCount(): number {
    return this.days.filter(d => d.isActive).length;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.saving) return;

    let hasError = false;
    for (const d of this.days) {
      d.invalid = d.isActive && (!d.startTime || !d.endTime || d.startTime >= d.endTime);
      if (d.invalid) hasError = true;
    }
    if (hasError) {
      this.snackBar.openSnackBar('Fix the highlighted days — start time must be before end time.', 'error');
      return;
    }

    this.saving = true;
    this.availabilityService.setProviderAvailability(this.trainerId, this.centerId, this.days.map(d => ({
      dayOfWeek: d.dayOfWeek,
      isActive: d.isActive,
      startTime: d.startTime,
      endTime: d.endTime,
    }))).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.openSnackBar('Availability updated.', '');
        this.onUpdateEmit.emit();
        this.dialogRef.close();
      },
      error: err => {
        this.saving = false;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      }
    });
  }
}
