import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Users } from 'src/app/models/users.interface';
import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { BookingFormComponent, BookingFormData } from './booking-form/booking-form.component';

/**
 * Opens the "Book a session" form as a modal for a signed-in client. A visitor
 * who is not signed in is sent to the provider's public booking page instead,
 * where they can pick a day and time first and are only asked to log in or
 * create an account when they send the request.
 */
@Injectable({ providedIn: 'root' })
export class BookingDialogService {

  private user: Users | null = null;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private router: Router,
  ) {
    this.store.dispatch(loadUser());
    this.store.select(selectUser).subscribe(user => this.user = user);
  }

  openBookingForm(data: BookingFormData): void {
    const userEmail = this.user?.email;

    if (!userEmail) {
      const slug = (data.providerName ?? '').replace(/ /g, '-');
      if (slug) {
        this.router.navigate([data.centerId ? '/centers' : '/trainers', slug, 'book']);
        return;
      }
    }

    this.dialog.open(BookingFormComponent, {
      width: '560px',
      maxWidth: '95vw',
      disableClose: true,
      data
    });
  }
}
