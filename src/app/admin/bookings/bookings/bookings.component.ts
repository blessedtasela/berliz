import { Component } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Booking } from 'src/app/models/booking.model';
import { loadAllBookings, loadAllBookingsFailure, loadAllBookingsSuccess } from 'src/app/state/booking/booking.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { selectBookings, selectBookingLoading } from 'src/app/state/booking/booking.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
    selector: 'app-bookings',
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.css'],
    standalone: false
})
export class BookingsComponent {
  bookingsData: Booking[] = [];
  totalBookings: number = 0;
  bookingsLength: number = 0;
  searchComponent: string = 'booking';
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];
  /** Why the list couldn't be loaded -- so a failed load never reads as an empty table (and never leaves the global spinner stuck). */
  loadError: string | null = null;
  /** True until the first load settles (success or failure) -- gates the empty-state message so it can't flash during a fetch. */
  loading = true;

  readonly selectBookings = selectBookings;
  readonly bookingSearchFields: AdminSearchField<Booking>[] = [
    { value: 'client', label: 'Client email', accessor: b => b.clientEmail },
    { value: 'trainer', label: 'Trainer', accessor: b => b.trainerName ?? '' },
    { value: 'center', label: 'Center', accessor: b => b.centerName ?? '' },
    { value: 'status', label: 'Status', accessor: b => b.status },
    { value: 'id', label: 'Booking id', accessor: b => b.id?.toString() },
  ];

  constructor(private ngxService: NgxUiLoaderService,
    private store: Store, private actions$: Actions) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.subscriptions.push(watchLoadError(this.actions$, loadAllBookingsFailure, [loadAllBookings, loadAllBookingsSuccess], null, m => this.loadError = m));
    this.subscriptions.push(this.store.select(selectBookingLoading).subscribe(l => {
      this.loading = l;
      // The global overlay must clear on failure too -- it only ever started on this dispatch, so this is the one place that can stop it.
      if (l) this.ngxService.start(); else this.ngxService.stop();
    }));
    this.store.dispatch(loadAllBookings());
    this.subscriptions.push(
      this.store.select(selectBookings).subscribe((allBookings) => {
        this.bookingsData = allBookings;
        this.totalBookings = allBookings.length
        this.bookingsLength = allBookings.length
      })
    );
  }

  retryLoad(): void {
    this.store.dispatch(loadAllBookings());
  }

  handleSearchResults(results: Booking[]): void {
    this.bookingsData = results;
    this.totalBookings = results.length;
  }

}
