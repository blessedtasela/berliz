import { Booking } from 'src/app/models/booking.model';
import {
  amountToPay, canClientPay, canMarkNoShow, clientCancelNote, clientRefundFraction,
  isRefundedCancellation, payByNote, payLabel, paymentBadge, statusLabel
} from './booking-payment.util';

describe('booking-payment.util', () => {
  const NOW = new Date('2026-10-05T12:00:00Z');
  const inHours = (h: number) => new Date(NOW.getTime() + h * 3600_000);

  const booking = (over: Partial<Booking> = {}): Booking => ({
    id: 1,
    status: 'confirmed',
    scheduledAt: inHours(72),
    durationMinutes: 60,
    paymentStatus: 'UNPAID',
    amountDue: 115,
    ...over,
  } as Booking);

  describe('what to pay', () => {
    it('is the whole amount when nothing has been paid', () => {
      expect(amountToPay(booking())).toBe(115);
      expect(payLabel(booking())).toBe('Pay $115.00');
    });

    it('is only the balance after a paid session was extended', () => {
      const b = booking({ amountPaid: 100, amountDue: 150, balanceDue: 50 });
      expect(amountToPay(b)).toBe(50);
      expect(payLabel(b)).toBe('Pay extra $50.00');
    });

    it('lets the client pay a confirmed or completed unpaid session, but not the provider', () => {
      expect(canClientPay(booking(), 'client')).toBeTrue();
      expect(canClientPay(booking({ status: 'completed' }), 'client')).toBeTrue();
      expect(canClientPay(booking(), 'provider')).toBeFalse();
    });

    it('does not offer payment when pending, cancelled, paid, refunded or nothing is owed', () => {
      expect(canClientPay(booking({ status: 'pending' }), 'client')).toBeFalse();
      expect(canClientPay(booking({ status: 'cancelled' }), 'client')).toBeFalse();
      for (const s of ['PAID', 'REFUNDED', 'PARTIALLY_REFUNDED', 'NOT_REQUIRED', null] as const) {
        expect(canClientPay(booking({ paymentStatus: s }), 'client')).withContext(String(s)).toBeFalse();
      }
      expect(canClientPay(booking({ amountDue: 0, balanceDue: 0 }), 'client')).toBeFalse();
    });
  });

  describe('labels', () => {
    it('reads no_show as "No-show" and title-cases the rest', () => {
      expect(statusLabel('no_show')).toBe('No-show');
      expect(statusLabel('confirmed')).toBe('Confirmed');
      expect(statusLabel(null)).toBe('');
    });

    it('words the badge per side and per state', () => {
      expect(paymentBadge(booking(), 'client')?.label).toBe('Payment due');
      expect(paymentBadge(booking(), 'provider')?.label).toBe('Awaiting payment');
      expect(paymentBadge(booking({ amountPaid: 100, balanceDue: 50 }), 'client')?.label).toBe('Balance due');
      expect(paymentBadge(booking({ paymentStatus: 'PAID' }), 'client')?.label).toBe('Paid');
      expect(paymentBadge(booking({ paymentStatus: 'REFUNDED', status: 'cancelled' }), 'client')?.label).toBe('Refunded');
      expect(paymentBadge(booking({ paymentStatus: 'PARTIALLY_REFUNDED', status: 'cancelled' }), 'client')?.label).toBe('Partly refunded');
    });

    it('has no badge for an unpriced booking, a pending one, or a cancelled one that was never paid', () => {
      expect(paymentBadge(booking({ paymentStatus: null }), 'client')).toBeNull();
      expect(paymentBadge(booking({ status: 'pending' }), 'client')).toBeNull();
      expect(paymentBadge(booking({ status: 'cancelled' }), 'client')).toBeNull();
    });
  });

  describe('pay-by note', () => {
    it('shows the deadline for a confirmed, unpaid session', () => {
      const note = payByNote(booking({ paymentDueAt: inHours(20) }));
      expect(note).toContain('Pay by');
      expect(note).toContain('cancelled');
    });

    it('says an unpaid extension is undone, not the session cancelled', () => {
      const note = payByNote(booking({ paymentDueAt: inHours(20), amountPaid: 100, amountDue: 150, balanceDue: 50 }))!;
      expect(note).toContain('Pay the extra by');
      expect(note).toContain('longer session is undone');
      expect(note).not.toContain('cancelled');
    });

    it('is absent once paid, when not confirmed, or without a deadline', () => {
      expect(payByNote(booking({ paymentDueAt: inHours(20), paymentStatus: 'PAID' }))).toBeNull();
      expect(payByNote(booking({ paymentDueAt: inHours(20), status: 'completed' }))).toBeNull();
      expect(payByNote(booking({ paymentDueAt: null }))).toBeNull();
    });
  });

  describe('cancellation policy', () => {
    it('gives everything back 24h or more ahead, half inside the window, nothing once started', () => {
      expect(clientRefundFraction(booking({ scheduledAt: inHours(24) }), NOW)).toBe(1);
      expect(clientRefundFraction(booking({ scheduledAt: inHours(23) }), NOW)).toBe(0.5);
      expect(clientRefundFraction(booking({ scheduledAt: inHours(0) }), NOW)).toBe(0);
      expect(clientRefundFraction(booking({ scheduledAt: inHours(-1) }), NOW)).toBe(0);
    });

    it('spells out the refund in the cancel prompt for a paid session', () => {
      const paid = { paymentStatus: 'PAID' as const, amountPaid: 100, amountDue: 100 };
      expect(clientCancelNote(booking({ ...paid, scheduledAt: inHours(48) }), NOW)).toContain('full payment of $100.00');
      const late = clientCancelNote(booking({ ...paid, scheduledAt: inHours(5) }), NOW);
      expect(late).toContain('only 50%');
      expect(late).toContain('less than 24 hours');
      expect(late).toContain('$50.00 of $100.00');
      expect(clientCancelNote(booking({ ...paid, scheduledAt: inHours(-1) }), NOW)).toContain('not refunded');
    });

    it('says nothing when nothing is at stake', () => {
      expect(clientCancelNote(booking(), NOW)).toBeNull();                                  // unpaid
      expect(clientCancelNote(booking({ status: 'pending', paymentStatus: 'PAID', amountPaid: 100 }), NOW)).toBeNull();
    });
  });

  describe("a provider's own cancellation policy", () => {
    const paid = { paymentStatus: 'PAID' as const, amountPaid: 100, amountDue: 100 };

    it('uses the window and refund share pinned on the booking', () => {
      const b = booking({ ...paid, scheduledAt: inHours(30), freeCancelHours: 48, lateCancelRefundPercent: 25 });
      expect(clientRefundFraction(b, NOW)).toBe(0.25);
      const note = clientCancelNote(b, NOW)!;
      expect(note).toContain('less than 48 hours');
      expect(note).toContain('only 25%');
      expect(note).toContain('$25.00 of $100.00');
    });

    it('a shorter window keeps a closer cancellation free', () => {
      const b = booking({ ...paid, scheduledAt: inHours(13), freeCancelHours: 12 });
      expect(clientRefundFraction(b, NOW)).toBe(1);
    });

    it('a zero-hour window means every cancellation before the start is late', () => {
      const b = booking({ ...paid, scheduledAt: inHours(200), freeCancelHours: 0, lateCancelRefundPercent: 50 });
      expect(clientRefundFraction(b, NOW)).toBe(0.5);
      expect(clientCancelNote(b, NOW)).toContain("doesn't offer free cancellation");
    });

    it('says plainly when a late cancel refunds nothing', () => {
      const b = booking({ ...paid, scheduledAt: inHours(5), lateCancelRefundPercent: 0 });
      expect(clientRefundFraction(b, NOW)).toBe(0);
      expect(clientCancelNote(b, NOW)).toContain('not refunded');
    });

    it('a 100% late refund means a late cancel is still free', () => {
      const b = booking({ ...paid, scheduledAt: inHours(5), lateCancelRefundPercent: 100 });
      expect(clientRefundFraction(b, NOW)).toBe(1);
      expect(clientCancelNote(b, NOW)).toContain('full payment');
    });

    it('falls back to the platform default when the booking carries none', () => {
      expect(clientRefundFraction(booking({ ...paid, scheduledAt: inHours(5) }), NOW)).toBe(0.5);
    });
  });

  describe('no-show and reopening', () => {
    it('can only be recorded once a confirmed session has started', () => {
      expect(canMarkNoShow(booking({ scheduledAt: inHours(-1) }), NOW)).toBeTrue();
      expect(canMarkNoShow(booking({ scheduledAt: inHours(1) }), NOW)).toBeFalse();
      expect(canMarkNoShow(booking({ status: 'pending', scheduledAt: inHours(-1) }), NOW)).toBeFalse();
    });

    it('treats a refunded cancellation as not reopenable', () => {
      expect(isRefundedCancellation(booking({ paymentStatus: 'REFUNDED' }))).toBeTrue();
      expect(isRefundedCancellation(booking({ paymentStatus: 'PARTIALLY_REFUNDED' }))).toBeTrue();
      expect(isRefundedCancellation(booking({ paymentStatus: 'UNPAID' }))).toBeFalse();
    });
  });
});
