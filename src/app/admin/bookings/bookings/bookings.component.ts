import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Booking } from 'src/app/models/booking.model';
import { loadAllBookings } from 'src/app/state/booking/booking.actions';
import { selectBookings } from 'src/app/state/booking/booking.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css']
})
export class BookingsComponent {
  bookingsData: Booking[] = [];
  totalBookings: number = 0;
  bookingsLength: number = 0;
  searchComponent: string = 'booking';
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];

  readonly selectBookings = selectBookings;
  readonly bookingSearchFields: AdminSearchField<Booking>[] = [
    { value: 'client', label: 'Client email', accessor: b => b.clientEmail },
    { value: 'trainer', label: 'Trainer', accessor: b => b.trainerName ?? '' },
    { value: 'center', label: 'Center', accessor: b => b.centerName ?? '' },
    { value: 'status', label: 'Status', accessor: b => b.status },
    { value: 'id', label: 'Booking id', accessor: b => b.id?.toString() },
  ];

  constructor(private ngxService: NgxUiLoaderService,
    private store: Store) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadAllBookings());
    this.subscriptions.push(
      this.store.select(selectBookings).subscribe((allBookings) => {
        this.bookingsData = allBookings;
        this.totalBookings = allBookings.length
        this.bookingsLength = allBookings.length
        this.ngxService.stop()
      })
    );
  }

  handleSearchResults(results: Booking[]): void {
    this.bookingsData = results;
    this.totalBookings = results.length;
  }

}
