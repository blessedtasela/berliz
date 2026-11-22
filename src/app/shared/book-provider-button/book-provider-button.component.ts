import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { BookingLauncherService } from 'src/app/booking/booking-launcher.service';

/**
 * D10 — a login-gated "Book a session" action for a trainer or center, usable
 * anywhere their identity is known (feed posts, profile timelines, cards).
 * Renders nothing unless the role is trainer/center AND the matching provider
 * id is present.
 */
@Component({
    selector: 'app-book-provider-button',
    imports: [CommonModule, IconsModule],
    template: `
    <button *ngIf="canBook" type="button" (click)="book()"
      class="inline-flex items-center gap-1.5 font-semibold rounded-lg transition"
      [ngClass]="{
        'px-2.5 py-1 text-[11px]': size === 'sm',
        'px-4 py-2 text-xs': size === 'md',
        'w-full justify-center': block,
        'bg-red-600 text-white hover:bg-red-700': !subtle,
        'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100': subtle && !dark,
        'bg-brand-red/10 text-brand-red border border-brand-red/30 hover:bg-brand-red/20': subtle && dark
      }">
      <i-feather name="calendar" [style.width.px]="size === 'sm' ? 12 : 14" [style.height.px]="size === 'sm' ? 12 : 14"></i-feather>
      {{ label }}
    </button>
  `
})
export class BookProviderButtonComponent {
  @Input() role: string | null | undefined = null;
  @Input() trainerId: number | null | undefined = null;
  @Input() centerId: number | null | undefined = null;
  @Input() providerName = 'this provider';
  @Input() size: 'sm' | 'md' = 'sm';
  @Input() block = false;
  /** Quieter styling (tinted, not solid) for dense contexts like a feed card. */
  @Input() subtle = false;
  @Input() label = 'Book a session';
  /** GN-76: a brand-dark skin for a screen that's always dark regardless of the user's light/dark toggle --
   *  only changes the `subtle` tint (the solid variant is already brand-red regardless of background). */
  @Input() dark = false;

  constructor(private bookingLauncher: BookingLauncherService) {}

  get canBook(): boolean {
    const r = (this.role || '').toLowerCase();
    return (r === 'trainer' && !!this.trainerId) || (r === 'center' && !!this.centerId);
  }

  book(): void {
    const r = (this.role || '').toLowerCase();
    if (r === 'trainer' && this.trainerId) {
      this.bookingLauncher.startBooking({ trainerId: this.trainerId, providerName: this.providerName });
    } else if (r === 'center' && this.centerId) {
      this.bookingLauncher.startBooking({ centerId: this.centerId, providerName: this.providerName });
    }
  }
}
