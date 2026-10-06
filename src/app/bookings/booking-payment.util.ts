import { Booking } from 'src/app/models/booking.model';

/**
 * What the booking screens say and allow about money, in one place so the card, the details
 * modal and the cancel prompts can't disagree. Mirrors the server's rules (BookingPricing /
 * CancellationPolicy): the server is the authority, this only decides what to show.
 */

/**
 * Platform defaults, used when a booking carries no policy of its own: cancelling at least 24h before
 * the start refunds everything; inside that, half; once started, nothing. A provider can choose
 * different numbers, which the server pins on the booking when it is confirmed (freeCancelHours /
 * lateCancelRefundPercent) -- always prefer those.
 */
export const DEFAULT_FREE_CANCEL_HOURS = 24;
export const DEFAULT_LATE_CANCEL_REFUND_PERCENT = 50;

/** The free-cancellation window that applies to this booking, in hours. */
export function freeCancelHours(b: Booking): number {
  return b.freeCancelHours ?? DEFAULT_FREE_CANCEL_HOURS;
}

/** The share (0-100) refunded when the client cancels inside that window. */
export function lateRefundPercent(b: Booking): number {
  return b.lateCancelRefundPercent ?? DEFAULT_LATE_CANCEL_REFUND_PERCENT;
}

const HOUR_MS = 60 * 60 * 1000;

export type BookingMode = 'client' | 'provider';

export interface PaymentBadge { label: string; classes: string; }

const money = (n: number): string => n.toFixed(2);

/** What a Pay button would charge right now: the balance (just the difference after an extension), else the whole amount. */
export function amountToPay(b: Booking): number {
  return (b.balanceDue ?? b.amountDue ?? 0);
}

export function isExtensionBalance(b: Booking): boolean {
  return (b.amountPaid ?? 0) > 0 && b.paymentStatus === 'UNPAID';
}

export function canClientPay(b: Booking, mode: BookingMode): boolean {
  return mode === 'client'
    && b.paymentStatus === 'UNPAID'
    && (b.status === 'confirmed' || b.status === 'completed')
    && amountToPay(b) > 0;
}

export function payLabel(b: Booking): string {
  return `${isExtensionBalance(b) ? 'Pay extra' : 'Pay'} $${money(amountToPay(b))}`;
}

/** 'no_show' reads as "No-show"; everything else is just title-cased. */
export function statusLabel(status: string | null | undefined): string {
  if (!status) return '';
  if (status === 'no_show') return 'No-show';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/** Payment pill for both sides; null when there is nothing worth saying. */
export function paymentBadge(b: Booking, mode: BookingMode): PaymentBadge | null {
  const refundedState = b.paymentStatus === 'REFUNDED' || b.paymentStatus === 'PARTIALLY_REFUNDED';
  if (b.status === 'cancelled' && !refundedState) return null;

  switch (b.paymentStatus) {
    case 'PAID':
      return { label: 'Paid', classes: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900' };
    case 'REFUNDED':
      return { label: 'Refunded', classes: 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700' };
    case 'PARTIALLY_REFUNDED':
      return { label: 'Partly refunded', classes: 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700' };
    case 'UNPAID':
      if (b.status === 'pending') return null;
      return {
        label: mode === 'provider' ? 'Awaiting payment' : (isExtensionBalance(b) ? 'Balance due' : 'Payment due'),
        classes: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900',
      };
    default:
      return null;
  }
}

/** One line for a payment that has to be made by a deadline (a confirmed, wholly unpaid session). */
export function payByNote(b: Booking, locale = 'en-US'): string | null {
  if (b.paymentStatus !== 'UNPAID' || b.status !== 'confirmed' || !b.paymentDueAt) return null;
  const due = new Date(b.paymentDueAt);
  if (isNaN(due.getTime())) return null;
  const when = due.toLocaleString(locale, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  // Money already in means this is the extra for a longer session: at the deadline the extension is undone, the session stands.
  return (b.amountPaid ?? 0) > 0
    ? `Pay the extra by ${when} or the longer session is undone`
    : `Pay by ${when} or it's cancelled`;
}

/** The fraction of what was paid that a client gets back if they cancel at {@code now}. */
export function clientRefundFraction(b: Booking, now: Date = new Date()): number {
  const untilStart = new Date(b.scheduledAt).getTime() - now.getTime();
  const windowHours = freeCancelHours(b);
  // A window of 0 hours means no free cancellation: anything before the start is a late cancel.
  if (windowHours > 0 && untilStart >= windowHours * HOUR_MS) return 1;
  if (untilStart > 0) return lateRefundPercent(b) / 100;
  return 0;
}

/**
 * What to tell a client before they cancel a confirmed session they already paid for, so a late
 * cancellation is never a surprise. Null when nothing is at stake (unpaid, or still pending).
 */
export function clientCancelNote(b: Booking, now: Date = new Date()): string | null {
  const paid = b.amountPaid ?? (b.paymentStatus === 'PAID' ? b.amountDue ?? 0 : 0);
  if (b.status !== 'confirmed' || paid <= 0) return null;

  const fraction = clientRefundFraction(b, now);
  const hours = freeCancelHours(b);
  if (fraction >= 1) return `You'll get your full payment of $${money(paid)} back.`;
  if (new Date(b.scheduledAt).getTime() <= now.getTime()) return 'The session has already started, so your payment is not refunded.';
  const why = hours > 0 ? `This is less than ${hours} hours before the session` : 'This provider doesn\x27t offer free cancellation';
  if (fraction > 0) {
    return `${why}, so only ${Math.round(fraction * 100)}% is refunded ($${money(paid * fraction)} of $${money(paid)}) and the rest goes to the provider.`;
  }
  return `${why}, so your payment is not refunded.`;
}

/** The provider can mark a confirmed session as a no-show once its start time has passed. */
export function canMarkNoShow(b: Booking, now: Date = new Date()): boolean {
  return b.status === 'confirmed' && new Date(b.scheduledAt).getTime() <= now.getTime();
}

/** A cancelled session whose money has gone back can't be reopened by the provider (the server refuses it too). */
export function isRefundedCancellation(b: Booking): boolean {
  return b.paymentStatus === 'REFUNDED' || b.paymentStatus === 'PARTIALLY_REFUNDED';
}
