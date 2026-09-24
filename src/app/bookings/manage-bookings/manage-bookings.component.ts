import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { selectUser } from 'src/app/state/user/user.selector';
import { selectProviderBookings } from 'src/app/state/booking/booking.selectors';
import { loadMyProviderBookings } from 'src/app/state/booking/booking.actions';
import { Users } from 'src/app/models/users.interface';

/**
 * Single "Bookings" page, replacing the old split between /dashboard/my-bookings
 * (client-made) and the hard-to-find /dashboard/hub/my-provider-bookings
 * (bookings made WITH a trainer/center) — the latter had no sidebar entry at
 * all, so trainers had no way to discover incoming booking requests. Anyone
 * signed in sees their own bookings; a trainer/center additionally gets a
 * toggle to the requests-from-others view, with a pending-count badge so an
 * unanswered request is visible without switching tabs first.
 */
@Component({
  selector: 'app-manage-bookings',
  templateUrl: './manage-bookings.component.html',
  styleUrls: ['./manage-bookings.component.css']
})
export class ManageBookingsComponent implements OnInit, OnDestroy {

  view: 'mine' | 'requests' = 'mine';
  user: Users | null = null;
  pendingRequestCount = 0;

  private destroy$ = new Subject<void>();

  constructor(private store: Store) { }

  /** Only ever pushes the default forward automatically, once, right after
   *  we first learn the viewer is a provider -- never overrides a view
   *  they've since clicked into themselves. */
  private defaultedToRequests = false;

  ngOnInit(): void {
    this.store.select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
        if (this.isProvider) {
          this.store.dispatch(loadMyProviderBookings());
          // A trainer/center's real activity here is requests FROM clients,
          // not bookings they themselves made with someone else -- landing
          // on "My bookings" by default meant they had to know to click
          // "Requests" before seeing anything, even fully confirmed/completed
          // sessions.
          if (!this.defaultedToRequests) {
            this.defaultedToRequests = true;
            this.view = 'requests';
          }
        }
      });

    this.store.select(selectProviderBookings)
      .pipe(takeUntil(this.destroy$))
      .subscribe(bookings => {
        this.pendingRequestCount = (bookings ?? []).filter(b => b.status === 'pending').length;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isProvider(): boolean {
    const role = (this.user?.role ?? '').toLowerCase();
    return role === 'trainer' || role === 'center';
  }

  setView(view: 'mine' | 'requests'): void {
    this.view = view;
  }
}
