import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { Users } from 'src/app/models/users.interface';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { BookingFormComponent, BookingFormData } from './booking-form/booking-form.component';

/**
 * Opens the "Book a session" form as a modal, gated on the visitor being
 * logged in — same login-gate pattern as TestimonialDialogService.
 */
@Injectable({ providedIn: 'root' })
export class BookingDialogService {

  private user: Users | null = null;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private authRedirect: AuthRedirectService,
  ) {
    this.store.dispatch(loadUser());
    this.store.select(selectUser).subscribe(user => this.user = user);
  }

  openBookingForm(data: BookingFormData): void {
    const userEmail = this.user?.email;

    if (!userEmail) {
      const loginDialogRef = this.dialog.open(PromptModalComponent, {
        width: '400px',
        maxWidth: '95vw',
        data: {
          confirmation: true,
          title: 'Login required',
          message: 'You need to be logged in to book a session. Log in to continue?',
          confirmText: 'Log in',
          cancelText: 'Cancel',
          icon: 'log-in'
        }
      });

      loginDialogRef.afterClosed().subscribe(result => {
        // 'book' -- the trainer/center page this dialog was opened from checks
        // for this on return and re-opens the form automatically, since it
        // already has everything (data) needed without round-tripping it
        // through the URL.
        if (result) {
          this.authRedirect.goToLogin('book');
        }
      });
      return;
    }

    this.dialog.open(BookingFormComponent, {
      width: '560px',
      maxWidth: '95vw',
      disableClose: true,
      data
    });
  }
}
