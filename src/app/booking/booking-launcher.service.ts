import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

/** Exactly one of trainerId / centerId is set — a booking is with one or the other. */
export interface BookingTarget {
  trainerId?: number;
  centerId?: number;
  providerName: string;
}

/**
 * Where "Book a session" goes: the provider's own booking page (`/trainers/:name/book`,
 * `/centers/:name/book`), for everyone. It is a real page, not a pop-up, so it has its own
 * link to share and works for a visitor who is not signed in yet — they pick a day and time
 * first and are only asked to log in or create an account when they send the request.
 */
@Injectable({ providedIn: 'root' })
export class BookingLauncherService {

  constructor(private router: Router) { }

  startBooking(target: BookingTarget): void {
    this.open(target, 'book');
  }

  /** The provider's Level Up page: subscribe, buy a session pack or get a membership. */
  startLevelUp(target: BookingTarget, planId?: number): void {
    this.open(target, 'level-up', planId != null ? { plan: planId } : undefined);
  }

  private open(target: BookingTarget, page: 'book' | 'level-up', queryParams?: { plan: number }): void {
    const slug = (target.providerName ?? '').replace(/ /g, '-');
    if (!slug) return;
    this.router.navigate([target.centerId ? '/centers' : '/trainers', slug, page], { queryParams });
  }
}
