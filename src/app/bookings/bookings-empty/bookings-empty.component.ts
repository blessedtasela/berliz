import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bookings-empty',
  templateUrl: './bookings-empty.component.html',
  styleUrls: ['./bookings-empty.component.css']
})
export class BookingsEmptyComponent {
  @Input() message = 'No bookings yet.';
}
