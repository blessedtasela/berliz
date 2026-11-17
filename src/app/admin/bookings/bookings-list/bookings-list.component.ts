import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Component, Input, DestroyRef, inject } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Booking } from 'src/app/models/booking.model';
import { BookingService } from 'src/app/services/booking.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { Store } from '@ngrx/store';
import { loadAllBookings } from 'src/app/state/booking/booking.actions';
import { selectBookings } from 'src/app/state/booking/booking.selectors';
import { nameSlug } from 'src/app/utils/closest-slug';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-bookings-list',
    templateUrl: './bookings-list.component.html',
    styleUrls: ['./bookings-list.component.css'],
    standalone: false
})
export class BookingsListComponent {
  private destroyRef = inject(DestroyRef);
  responseMessage: any;
  @Input() bookingsData: Booking[] = [];
  @Input() totalBookings: number = 0;

  constructor(private datePipe: DatePipe,
    private bookingService: BookingService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private store: Store) {
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadAllBookings());
    this.store.select(selectBookings).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((allBookings) => {
      this.bookingsData = allBookings;
      this.totalBookings = this.bookingsData.length
      this.ngxService.stop()
    });
  }

  who(booking: Booking): string {
    return booking.trainerName || booking.centerName || '—';
  }

  /** A confirmed or completed booking the customer still hasn't paid for. */
  canRemind(booking: Booking): boolean {
    return booking.paymentStatus === 'UNPAID' && (booking.status === 'confirmed' || booking.status === 'completed');
  }

  remindPayment(booking: Booking) {
    if (!this.canRemind(booking)) return;
    this.ngxService.start();
    this.bookingService.remindPayment(booking.id).subscribe({
      next: (response: any) => {
        this.ngxService.stop();
        this.snackbarService.openSnackBar(response?.message || 'Reminder sent', '');
      },
      error: (error: any) => {
        this.ngxService.stop();
        this.snackbarService.openSnackBar(error.error?.message || genericError, 'error');
      },
    });
  }

  updateStatus(id: number, status: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: `mark this booking as ${status}?`,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.ngxService.start();
      this.bookingService.updateStatus(id, status)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close();
        }, (error) => {
          this.ngxService.stop();
          this.responseMessage = error.error?.message || genericError;
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

  /** PF-58: only a completed trainer session has a review slot to send a link to -- a review
   *  always has to be left against a trainer (TrainerReview), centers have no equivalent flow. */
  canCopyReviewLink(booking: Booking): boolean {
    return booking.status === 'completed' && !!booking.trainerName;
  }

  /** PF-58: the exact deep link a client already reaches by tapping "Leave a review" on their own
   *  My Bookings page (booking-card.component.ts) -- copied here so the owner can hand it to a
   *  specific client directly (text, WhatsApp, email) instead of waiting for them to find it. */
  async copyReviewLink(booking: Booking): Promise<void> {
    if (!this.canCopyReviewLink(booking)) return;
    const url = `${environment.baseUrl}/trainers/${nameSlug(booking.trainerName)}#add-review`;
    try {
      await navigator.clipboard.writeText(url);
      this.snackbarService.openSnackBar('Review link copied', '');
    } catch {
      this.snackbarService.openSnackBar(url, 'error');
    }
  }

  formatDate(dateString: any): any {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm');
  }

}
