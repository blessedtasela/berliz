import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { catchError, take } from 'rxjs/operators';
import { of } from 'rxjs';

import { BookingService } from 'src/app/services/booking.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { Trainers } from 'src/app/models/trainers.interface';
import { BookingLocationSelection } from 'src/app/booking/booking-location-picker/booking-location-picker.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { MyClientSummary } from 'src/app/models/booking.model';
import { memoizePhotoUriByKey } from 'src/app/shared/photo-lightbox/photo-data-uri';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Provider-facing "book a session directly for one of my clients" -- the
 * provider creating it IS the approval, so it goes straight to confirmed
 * (see BookingService.createBookingForClient). Picks from the provider's own
 * booking history (GET /booking/myClients) rather than a free-text email, so
 * there's no way to silently create a booking for the wrong person.
 */
@Component({
    selector: 'app-book-for-client-modal',
    templateUrl: './book-for-client-modal.component.html',
    styleUrls: ['./book-for-client-modal.component.css'],
    standalone: false
})
export class BookForClientModalComponent implements OnInit {

  clients: MyClientSummary[] = [];
  clientsLoading = true;
  selectedClientId: number | null = null;

  readonly durationOptions = [30, 45, 60, 90, 120];
  date: string = this.formatDateLocal(new Date());
  time = '';
  durationMinutes = 60;
  notes = '';
  submitting = false;

  /** The signed-in provider's own trainer record when they are a trainer (centers have none) -- feeds the location picker. */
  myTrainer: Trainers | null = null;
  locationSelection: BookingLocationSelection | null = null;

  private readonly _photoUri = memoizePhotoUriByKey();

  constructor(
    public dialogRef: MatDialogRef<BookForClientModalComponent>,
    private bookingService: BookingService,
    private snackBar: SnackBarService,
    private trainerService: TrainerService,
  ) { }

  ngOnInit(): void {
    // Optional extra: if this fails (or the provider is a center) the picker just doesn't appear.
    this.trainerService.getTrainer().pipe(take(1), catchError(() => of(null))).subscribe(res => {
      this.myTrainer = res?.data ?? null;
    });

    this.bookingService.getMyClients().pipe(take(1)).subscribe({
      next: (res) => {
        this.clients = res?.data ?? [];
        this.clientsLoading = false;
      },
      error: () => {
        this.clients = [];
        this.clientsLoading = false;
      },
    });
  }

  clientPhotoSrc(client: MyClientSummary): string | null {
    return this._photoUri(client.userId, client.photo);
  }

  private formatDateLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  get canSubmit(): boolean {
    return !!this.selectedClientId && !!this.date && !!this.time && !this.submitting
      && !this.locationSelection?.incomplete;
  }

  submit(): void {
    if (!this.canSubmit) return;

    this.submitting = true;
    this.bookingService.createBookingForClient({
      clientId: this.selectedClientId,
      localDate: this.date,
      localTime: this.time,
      durationMinutes: this.durationMinutes,
      notes: this.notes.trim(),
      trainerLocationId: this.locationSelection?.trainerLocationId,
      customLocation: this.locationSelection?.customLocation,
    }).pipe(take(1)).subscribe({
      next: (res) => {
        this.submitting = false;
        this.snackBar.openSnackBar(res?.data?.message || res?.message || 'Booking created and confirmed', '');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting = false;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      },
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
