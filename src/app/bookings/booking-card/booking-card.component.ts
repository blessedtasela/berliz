import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Booking } from 'src/app/models/booking.model';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { ReviewBookingModalComponent, ReviewBookingModalResult } from '../review-booking-modal/review-booking-modal.component';
import { BookingDetailsModalComponent } from '../booking-details-modal/booking-details-modal.component';
import { nameSlug } from 'src/app/utils/closest-slug';
import {
  PaymentBadge, canClientPay, canMarkNoShow, clientCancelNote, isRefundedCancellation,
  directPaymentNote, payByNote, payLabel, paymentBadge, statusLabel
} from '../booking-payment.util';

export interface RescheduleRequest {
  id: number;
  localDate: string;
  localTime: string;
  durationMinutes: number;
}

@Component({
    selector: 'app-booking-card',
    templateUrl: './booking-card.component.html',
    styleUrls: ['./booking-card.component.css'],
    standalone: false
})
export class BookingCardComponent {

  constructor(private dialog: MatDialog, private router: Router) { }

  /** 'client' shows who you booked with + a cancel action while pending.
   *  'provider' shows who booked you + confirm/complete/cancel actions. */
  @Input() mode: 'client' | 'provider' = 'client';
  @Input() booking!: Booking;
  /** The client's onboarding completion (0-100) for the provider view; undefined while unknown, so nothing is shown. */
  @Input() onboardingPercent: number | null | undefined;
  /** Whether this client already has an intake form started or submitted -- changes "Fill Together" to reopen it instead of starting a blank one, and hides "Send Intake Form" (nothing left to ask for). */
  @Input() hasIntake = false;
  /** PF-43: does the client still have an unreviewed completed session with this trainer --
   *  undefined while unknown (chip hidden), never a guess. The parent fetches this per trainer. */
  @Input() reviewSlotAvailable: boolean | null | undefined;

  @Output() cancelRequested = new EventEmitter<number>();
  @Output() statusChangeRequested = new EventEmitter<{ id: number; status: string }>();
  @Output() rescheduleRequested = new EventEmitter<RescheduleRequest>();
  @Output() deleteRequested = new EventEmitter<number>();
  /** Client tapped "Pay" on a confirmed session; the parent starts Stripe Checkout. */
  @Output() payRequested = new EventEmitter<number>();
  @Output() startIntakeRequested = new EventEmitter<{ clientId: number; clientName: string }>();
  @Output() sendIntakeRequested = new EventEmitter<{ clientId: number; clientName: string }>();

  get counterpartyName(): string {
    if (this.mode === 'client') {
      return this.booking.trainerName || this.booking.centerName || 'Provider';
    }
    return `${this.booking.clientFirstname ?? ''} ${this.booking.clientLastname ?? ''}`.trim()
      || this.booking.clientEmail || 'Client';
  }

  /**
   * Who the session is with, as a photo: the client's own photo for a provider looking at a request,
   * the trainer's or center's public photo URL for a client. Null falls back to initials in the avatar.
   */
  get counterpartyPhoto(): string | null {
    if (this.mode === 'provider') return this.booking.clientPhoto ?? null;
    const url = this.booking.trainerPhotoUrl || this.booking.centerPhotoUrl;
    return url ? resolveStrapiUrl(url) : null;
  }

  get counterpartySubtitle(): string {
    if (this.mode === 'client') {
      return this.booking.trainerName ? 'Trainer' : 'Center';
    }
    return this.booking.clientEmail || '';
  }

  get statusClasses(): string {
    switch (this.booking.status) {
      case 'confirmed': return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900';
      case 'completed': return 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900';
      case 'cancelled': return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
      case 'no_show': return 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900';
      default: return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900'; // pending
    }
  }

  get dotClasses(): string {
    switch (this.booking.status) {
      case 'confirmed': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-gray-400';
      case 'no_show': return 'bg-red-500';
      default: return 'bg-amber-500';
    }
  }

  get statusLabel(): string {
    return statusLabel(this.booking.status);
  }

  /** The provider has confirmed and priced this session and the client hasn't paid (all of) it yet. */
  get canClientPay(): boolean {
    return canClientPay(this.booking, this.mode);
  }

  /** "Pay $115.00", or "Pay extra $50.00" when a paid session was extended. */
  get payButtonLabel(): string {
    return payLabel(this.booking);
  }

  /** "Pay by Tue, Oct 6, 3:00 PM or it's cancelled" while a confirmed session is waiting on payment. */
  get payByText(): string | null {
    return payByNote(this.booking);
  }

  /** "Pay <provider> directly. Berliz keeps the booking on record." for a provider who takes payment themselves. */
  get directPaymentText(): string | null {
    return directPaymentNote(this.booking, this.mode, this.booking.trainerName ?? this.booking.centerName ?? null);
  }

  /** Payment pill shown to both sides; null when there's nothing worth saying (never priced, or nothing to pay). */
  get paymentBadge(): PaymentBadge | null {
    return paymentBadge(this.booking, this.mode);
  }

  pay(): void {
    this.payRequested.emit(this.booking.id);
  }

  /** A client can withdraw a pending request, or cancel a confirmed session (the refund depends on how late -- see clientCancelNote). */
  get canClientCancel(): boolean {
    return this.mode === 'client' && (this.booking.status === 'pending' || this.booking.status === 'confirmed');
  }

  /** BK-24: the onboarding questionnaire and the signed intake are two separate records that were
   *  never unified -- a client could have a completed, signed intake on file while this tracker
   *  still read 0%, so the chip told the trainer the opposite of the truth. A real intake on file
   *  always wins: it is the one client-readiness signal that is actually true until BK-28 merges
   *  the two into one record. */
  get onboardingChip(): { label: string; classes: string } | null {
    if (this.mode !== 'provider') return null;
    if (this.booking.status !== 'pending' && this.booking.status !== 'confirmed') return null;
    if (this.hasIntake) {
      return { label: 'Intake complete', classes: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900' };
    }
    if (this.onboardingPercent == null) return null;
    return this.onboardingPercent >= 100
      ? { label: 'Onboarding complete', classes: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900' }
      : { label: 'Onboarding incomplete', classes: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900' };
  }

  get onboardingChipTitle(): string {
    return this.hasIntake
      ? 'Signed intake form on file. Tap to read it.'
      : `${this.onboardingPercent}% of the required onboarding answers. Tap to read them.`;
  }

  openOnboarding(event: Event): void {
    event.stopPropagation();
    // A real intake on file is the actual readiness record -- send the trainer to the signed
    // answers (same route "View Intake Form" already opens), not the separate onboarding tracker.
    if (this.hasIntake) {
      this.startIntake();
      return;
    }
    this.router.navigate(['/dashboard/clients', this.booking.clientId, 'onboarding']);
  }

  /** One tap back into booking with the same trainer or center, from a session that is over (completed, or cancelled). */
  get canRebook(): boolean {
    return this.mode === 'client'
      && (this.booking.status === 'completed' || this.booking.status === 'cancelled')
      && !!(this.booking.trainerName || this.booking.centerName);
  }

  rebook(): void {
    const isTrainer = !!this.booking.trainerName;
    const name = (isTrainer ? this.booking.trainerName : this.booking.centerName) as string;
    this.router.navigate([isTrainer ? '/trainers' : '/centers', nameSlug(name), 'book']);
  }

  /** PF-43: a completed trainer session the client hasn't used up their review slot for yet.
   *  No center equivalent -- TrainerReview has no center counterpart. */
  get canLeaveReview(): boolean {
    return this.mode === 'client' && this.booking.status === 'completed'
      && !!this.booking.trainerName && !!this.reviewSlotAvailable;
  }

  leaveReview(): void {
    this.router.navigate(['/trainers', nameSlug(this.booking.trainerName as string)], { fragment: 'add-review' });
  }

  /** Confirmed, and the start time has passed: the provider can record that the client never came. */
  get canProviderNoShow(): boolean {
    return this.mode === 'provider' && canMarkNoShow(this.booking);
  }

  get canProviderConfirm(): boolean {
    return this.mode === 'provider' && this.booking.status === 'pending';
  }

  /** The session's scheduled end (start + duration) -- the earliest moment it can be marked completed (BK-33). */
  private get scheduledEnd(): Date | null {
    if (!this.booking.scheduledAt) return null;
    const minutes = this.booking.durationMinutes ?? 0;
    return new Date(new Date(this.booking.scheduledAt).getTime() + minutes * 60_000);
  }

  private get hasEnded(): boolean {
    const end = this.scheduledEnd;
    return !!end && end.getTime() <= Date.now();
  }

  /** BK-33: a trainer must not be able to complete a session that hasn't happened yet. */
  get canProviderComplete(): boolean {
    return this.mode === 'provider' && this.booking.status === 'confirmed' && this.hasEnded;
  }

  /** True while a confirmed session is still ahead of its scheduled end -- shows the disabled
   *  button with a note instead of just hiding "Mark completed" outright. */
  get completionLocked(): boolean {
    return this.mode === 'provider' && this.booking.status === 'confirmed' && !this.hasEnded;
  }

  get completionUnlockNote(): string {
    const end = this.scheduledEnd;
    if (!end) return '';
    return `Unlocks at ${end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }

  get canProviderCancel(): boolean {
    return this.mode === 'provider' && (this.booking.status === 'pending' || this.booking.status === 'confirmed');
  }

  /** A trainer can start (or revisit) an intake once they've actually taken the client on. */
  get canStartIntake(): boolean {
    return this.mode === 'provider' && (this.booking.status === 'confirmed' || this.booking.status === 'completed');
  }

  /** A cancel could've been an accidental tap (or a change of mind) -- a cancelled
   *  request isn't a dead end, the provider can bring it back for review. */
  get canProviderReopen(): boolean {
    // Not once the client's money has gone back -- the server refuses it too.
    return this.mode === 'provider' && this.booking.status === 'cancelled' && !isRefundedCancellation(this.booking);
  }

  get canProviderDelete(): boolean {
    return this.mode === 'provider' && this.booking.status === 'cancelled';
  }

  /** Cancelling doesn't have to be the end of the conversation -- let the provider
   *  reach out directly if they still want to work something out with this client. */
  get canFollowUp(): boolean {
    return this.mode === 'provider' && this.booking.status === 'cancelled' && !!this.booking.clientId;
  }

  /** GN-33: every consequential action confirms first, completion included -- this one also
   *  releases the payout calculation, so it says so and can't be undone from this dialog. */
  private confirmComplete(): void {
    this.dialog.open(PromptModalComponent, {
      width: '360px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Mark this session completed?',
        message: `This marks your session with ${this.counterpartyName} as completed and releases the payout calculation. This can't be undone from here.`,
        confirmText: 'Mark completed',
        cancelText: 'Go back',
        icon: 'check-circle'
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.statusChangeRequested.emit({ id: this.booking.id, status: 'completed' });
    });
  }

  /** Provider recording that the client never came -- confirmed first, since it keeps their payment. */
  private confirmNoShow(): void {
    this.dialog.open(PromptModalComponent, {
      width: '360px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Mark as a no-show?',
        message: `${this.counterpartyName} didn't attend.`
          + (this.booking.paymentStatus === 'PAID' ? ' Their payment is kept and you are paid for the session.' : ' They had not paid, so nothing is charged.'),
        confirmText: 'Mark no-show',
        cancelText: 'Cancel',
        icon: 'user-x'
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.statusChangeRequested.emit({ id: this.booking.id, status: 'no_show' });
    });
  }

  /** Client cancelling their own pending request or confirmed session -- a confirm step guards against an accidental tap, and spells out the refund when money is at stake. */
  cancel(): void {
    const policyNote = clientCancelNote(this.booking);
    this.dialog.open(PromptModalComponent, {
      width: '360px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Cancel this booking?',
        message: this.booking.status === 'confirmed'
          ? `This session will be cancelled.${policyNote ? ' ' + policyNote : ''}`
          : 'This request will be withdrawn. You can always send a new one.',
        confirmText: 'Cancel booking',
        cancelText: 'Keep it',
        icon: 'x-circle'
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.cancelRequested.emit(this.booking.id);
    });
  }

  /** Provider cancelling a pending/confirmed booking -- same accidental-tap guard as the client side. */
  private confirmProviderCancel(): void {
    this.dialog.open(PromptModalComponent, {
      width: '360px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Cancel this session?',
        message: `${this.counterpartyName} will be notified this session is no longer happening.`
          + (this.booking.paymentStatus === 'PAID' ? ' They have already paid, so their payment will be refunded in full.' : ''),
        confirmText: 'Cancel session',
        cancelText: 'Keep it',
        icon: 'x-circle'
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.statusChangeRequested.emit({ id: this.booking.id, status: 'cancelled' });
    });
  }

  /** A pending request opens for review (who it's from, when, notes) before the provider decides -- "approve" or "reschedule" (pick a new time and confirm in one step). */
  private reviewAndConfirm(): void {
    this.dialog.open(ReviewBookingModalComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: { booking: this.booking }
    }).afterClosed().subscribe((result: ReviewBookingModalResult | undefined) => {
      if (!result) return;
      if (result.decision === 'confirmed') this.statusChangeRequested.emit({ id: this.booking.id, status: 'confirmed' });
      else if (result.decision === 'declined') this.statusChangeRequested.emit({ id: this.booking.id, status: 'cancelled' });
      else if (result.decision === 'rescheduled') {
        this.rescheduleRequested.emit({
          id: this.booking.id,
          localDate: result.localDate,
          localTime: result.localTime,
          durationMinutes: result.durationMinutes,
        });
      }
    });
  }

  setStatus(status: string): void {
    if (this.mode === 'provider' && status === 'cancelled') {
      this.confirmProviderCancel();
      return;
    }
    if (this.mode === 'provider' && status === 'no_show') {
      this.confirmNoShow();
      return;
    }
    if (this.mode === 'provider' && status === 'confirmed') {
      this.reviewAndConfirm();
      return;
    }
    if (this.mode === 'provider' && status === 'completed') {
      this.confirmComplete();
      return;
    }
    this.statusChangeRequested.emit({ id: this.booking.id, status });
  }

  /** Bring a cancelled request back for another look -- same review modal as a
   *  fresh request, so the provider sees the client's profile/notes again rather
   *  than a one-tap silent reversal. */
  reopen(): void {
    this.reviewAndConfirm();
  }

  remove(): void {
    this.dialog.open(PromptModalComponent, {
      width: '360px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Delete this cancelled request?',
        message: 'This removes it from your list for good. This can\'t be undone.',
        confirmText: 'Delete',
        cancelText: 'Keep it',
        icon: 'trash-2'
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.deleteRequested.emit(this.booking.id);
    });
  }

  followUp(): void {
    this.router.navigate(['/dashboard/messages'], { queryParams: { userId: this.booking.clientId } });
  }

  /** Trainer fills the form in together with the client, right now (e.g. in person). */
  startIntake(): void {
    this.startIntakeRequested.emit({ clientId: this.booking.clientId, clientName: this.counterpartyName });
  }

  /** Sends a blank form for the client to fill out and sign on their own time --
   *  confirmed first since it immediately emails/notifies the client. */
  sendIntake(): void {
    this.dialog.open(PromptModalComponent, {
      width: '360px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Send intake form?',
        message: `${this.counterpartyName} will get an email and in-app notification with a link to fill it out and sign.`,
        confirmText: 'Send',
        cancelText: 'Cancel',
        icon: 'send'
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.sendIntakeRequested.emit({ clientId: this.booking.clientId, clientName: this.counterpartyName });
    });
  }

  /** Clicking the card body (not one of its action buttons -- see the
   *  template's stopPropagation wrapper around them) shows more info. A
   *  still-pending request in provider mode already has a richer
   *  confirm/decline flow behind "Review request" -- open that instead of
   *  a second, read-only view of the same thing. */
  showDetails(): void {
    if (this.canProviderConfirm) {
      this.setStatus('confirmed');
      return;
    }
    this.dialog.open(BookingDetailsModalComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: { booking: this.booking, mode: this.mode },
    }).afterClosed().subscribe(result => {
      if (result === 'pay') this.pay();
    });
  }
}
