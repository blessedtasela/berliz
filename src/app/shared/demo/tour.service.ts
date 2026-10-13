import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, take } from 'rxjs';

import { selectUser } from 'src/app/state/user/user.selector';

export interface TourStep {
  title: string;
  text: string;
  /** Where "Take me there" goes; omitted for a step that is only an explanation. */
  link?: string[];
  linkLabel?: string;
}

interface TourState {
  steps: TourStep[];
  index: number;
}

const CLIENT_STEPS: TourStep[] = [
  {
    title: 'Find your coach or gym',
    text: 'Browse trainers and centers with their real hourly rates and review counts, then filter by price, coaching mode or reviews.',
    link: ['/dashboard/find-providers'], linkLabel: 'Open Find a Provider',
  },
  {
    title: 'Request a session',
    text: "Pick a time from their weekly hours and send a request. You're only charged once they confirm, and cancelling inside their free window refunds you in full.",
  },
  {
    title: 'Keep track in one place',
    text: 'Your requests, confirmations, payments and reminders all live in My bookings.',
    link: ['/dashboard/my-bookings'], linkLabel: 'Open My bookings',
  },
];

const PROVIDER_STEPS: TourStep[] = [
  {
    title: 'Set up what clients see',
    text: 'Your profile, rates, packages and weekly hours are what a visitor sees before they book. Fill those in first.',
    link: ['/dashboard/partnership'], linkLabel: 'Open my profile',
  },
  {
    title: 'Answer requests',
    text: 'New requests land in your provider bookings. Confirm one or suggest another time: requests left unanswered are withdrawn after 48 hours.',
    link: ['/dashboard/my-provider-bookings'], linkLabel: 'Open my bookings',
  },
  {
    title: 'Get paid',
    text: 'Connect Stripe once from your earnings page and payouts follow your completed sessions.',
  },
];

/** The 3-step tour for a role. Short on purpose: tours of one to three steps get finished, long ones do not. */
export function tourStepsFor(role: string | null | undefined): TourStep[] {
  const r = (role || '').toLowerCase();
  return r === 'trainer' || r === 'center' ? PROVIDER_STEPS : CLIENT_STEPS;
}

/**
 * A short, user-started walkthrough (never auto-starts). It is a set of cards rather than highlights pinned to
 * page elements, so it cannot break when a layout changes; each step can jump straight to the page it describes.
 */
@Injectable({ providedIn: 'root' })
export class TourService {

  private readonly state = new BehaviorSubject<TourState | null>(null);
  readonly state$ = this.state.asObservable();

  constructor(private store: Store) { }

  start(): void {
    this.store.select(selectUser).pipe(take(1)).subscribe(user => {
      this.state.next({ steps: tourStepsFor(user?.role), index: 0 });
    });
  }

  next(): void {
    const s = this.state.value;
    if (!s) return;
    if (s.index >= s.steps.length - 1) this.close();
    else this.state.next({ ...s, index: s.index + 1 });
  }

  back(): void {
    const s = this.state.value;
    if (s && s.index > 0) this.state.next({ ...s, index: s.index - 1 });
  }

  close(): void {
    this.state.next(null);
  }
}
