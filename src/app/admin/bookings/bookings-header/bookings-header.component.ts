import { Component, Input } from '@angular/core';
import { Booking } from 'src/app/models/booking.model';

@Component({
  selector: 'app-bookings-header',
  templateUrl: './bookings-header.component.html',
  styleUrls: ['./bookings-header.component.css']
})
export class BookingsHeaderComponent {
  selectedSortOption: string = 'date';
  @Input() bookingsData: Booking[] = [];
  @Input() totalBookings: number = 0;
  @Input() bookingsLength: number = 0;

  get pendingCount(): number {
    return this.bookingsData.filter(b => b.status === 'pending').length;
  }

  get confirmedCount(): number {
    return this.bookingsData.filter(b => b.status === 'confirmed').length;
  }

  get completedCount(): number {
    return this.bookingsData.filter(b => b.status === 'completed').length;
  }

  get cancelledCount(): number {
    return this.bookingsData.filter(b => b.status === 'cancelled').length;
  }

  sortBookingsData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.bookingsData.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        break;
      case 'client':
        this.bookingsData.sort((a, b) => (a.clientEmail || '').localeCompare(b.clientEmail || ''));
        break;
      case 'status':
        this.bookingsData.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
        break;
      case 'id':
        this.bookingsData.sort((a, b) => a.id - b.id);
        break;
      default:
        break;
    }
  }

  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortBookingsData();
  }
}
