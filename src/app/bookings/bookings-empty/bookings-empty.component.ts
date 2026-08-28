import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bookings-empty',
  templateUrl: './bookings-empty.component.html',
  styleUrls: ['./bookings-empty.component.css']
})
export class BookingsEmptyComponent {
  @Input() message = 'No bookings yet.';

  /** Only meaningful for a CLIENT's own booking list — a trainer/center
   *  viewing bookings made WITH them has no reason to "find" a provider. */
  @Input() showFindProviderCta = false;
}
