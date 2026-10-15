import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, Subject, catchError, of, take, takeUntil } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { DateStripComponent } from 'src/app/shared/date-strip/date-strip.component';
import { BookingLocationPickerComponent, BookingLocationSelection } from '../booking-location-picker/booking-location-picker.component';
import { BookingPriceEstimateComponent } from '../booking-price-estimate/booking-price-estimate.component';

import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { CenterService } from 'src/app/services/center.service';
import { ProviderPackageService } from 'src/app/services/provider-package.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { StripeService } from 'src/app/services/stripe.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SeoService } from 'src/app/services/seo.service';
import { WaitlistService } from 'src/app/services/waitlist.service';
import { clearGuestDraft, loadGuestDraft, saveGuestDraft } from '../guest-booking-draft';
import { environment } from 'src/environments/environment';

import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { createBooking, createBookingFailure, createBookingSuccess } from 'src/app/state/booking/booking.actions';
import { clearAvailableSlots, loadAvailableSlots } from 'src/app/state/availability/availability.actions';
import { selectAvailabilityLoading, selectAvailableSlots } from 'src/app/state/availability/availability.selectors';

import { ApiResponse } from 'src/app/models/Api.interface';
import { AvailableSlot } from 'src/app/models/availability.model';
import { ProviderPackage } from 'src/app/models/provider-package.model';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { Users } from 'src/app/models/users.interface';
import { genericError } from 'src/validators/form-validators.module';

type ProviderKind = 'trainer' | 'center';

/** What the client has chosen to book with, right now. */
type BookingOption =
  | { kind: 'single' }
  | { kind: 'ownedPackage'; subscription: Subscriptions }
  | { kind: 'buyPackage'; pkg: ProviderPackage };

/**
 * Standalone, shareable booking page — `/trainers/:name/book` and
 * `/centers/:name/book`. Complements (doesn't replace) BookingDialogService's
 * modal: a real URL a provider or client can share/deep-link directly to,
 * and the only place a client can buy or redeem a ProviderPackage rather
 * than just book one ad-hoc single session.
 */
@Component({
    selector: 'app-booking-page',
    imports: [CommonModule, FormsModule, RouterModule, IconsModule, DateStripComponent, BookingLocationPickerComponent, BookingPriceEstimateComponent],
    templateUrl: './booking-page.component.html'
})
export class BookingPageComponent implements OnInit, OnDestroy {

  /** Set via route `data: { kind: 'trainer' | 'center' }` -- see trainers-feature.module.ts / centers-feature.module.ts. */
  kind: ProviderKind = 'trainer';

  resolving = true;
  notFound = false;

  providerId = 0;
  providerName = '';
  providerPhotoUrl: string | null = null;

  packages: ProviderPackage[] = [];
  /** This client's own ACTIVE purchases of one of this provider's packages, keyed by providerPackage id. */
  ownedByPackageId = new Map<number, Subscriptions>();

  selectedOption: BookingOption = { kind: 'single' };
  buyingPackageId: number | null = null;

  // ── Slot picker — same shape/behavior as BookingFormComponent's ──────────
  selectedDate: string = this.formatDateLocal(new Date());
  selectedSlot: AvailableSlot | null = null;
  slots: AvailableSlot[] = [];
  slotDurationMinutes = 60;
  slotsLoading = false;
  minLeadTimeMinutes = 60;
  availabilityConfigured: boolean | null = null;
  slotsMessage = '';

  notes = '';

  /** Where to train -- trainers only; set by the location picker, which hides itself when the trainer offers no choice. */
  locationSelection: BookingLocationSelection | null = null;
  readonly maxNotesLength = 500;

  submitting = false;

  /** A visitor who is not signed in asked to send the request: show the log in / create account choice. */
  showAuthPrompt = false;

  /** Days (yyyy-MM-dd) this client has asked to be told about this session. */
  waitlistedDates = new Set<string>();
  waitlistBusy = false;
  /** Slot to re-select once the restored day's times arrive (set when a saved guest draft is applied). */
  private pendingSlotStart: string | null = null;

  private user: Users | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private actions$: Actions,
    private trainerService: TrainerService,
    private centerService: CenterService,
    private providerPackageService: ProviderPackageService,
    private subscriptionService: SubscriptionService,
    private stripeService: StripeService,
    private authRedirect: AuthRedirectService,
    private snackBar: SnackBarService,
    private seoService: SeoService,
    private waitlistService: WaitlistService,
  ) { }

  private get earliestBookableTime(): number {
    return Date.now() + this.minLeadTimeMinutes * 60_000;
  }

  get visibleSlots(): AvailableSlot[] {
    const cutoff = this.earliestBookableTime;
    return this.slots.filter(s => {
      const start = new Date(`${this.selectedDate}T${s.startTime}`).getTime();
      return isNaN(start) || start >= cutoff;
    });
  }

  get allSlotsWithinLeadTime(): boolean {
    return this.slots.length > 0 && this.visibleSlots.length === 0;
  }

  get useManualEntry(): boolean {
    return this.availabilityConfigured === false;
  }

  get remainingNotesChars(): number {
    return this.maxNotesLength - (this.notes?.length ?? 0);
  }

  get isSingleSelected(): boolean {
    return this.selectedOption.kind === 'single';
  }

  isPackageOwned(pkg: ProviderPackage): boolean {
    return this.ownedByPackageId.has(pkg.id);
  }

  isPackageSelected(pkg: ProviderPackage): boolean {
    return (this.selectedOption.kind === 'ownedPackage' && this.selectedOption.subscription.providerPackage?.id === pkg.id)
      || (this.selectedOption.kind === 'buyPackage' && this.selectedOption.pkg.id === pkg.id);
  }

  ngOnInit(): void {
    this.kind = (this.route.snapshot.data['kind'] as ProviderKind) ?? 'trainer';

    this.store.dispatch(loadUser());
    this.store.select(selectUser).pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.user = user;
      // The profile can arrive after the provider does (back from sign-in): pick the saved choice up then.
      if (user?.email && this.providerId && this.restoreGuestDraft()) {
        this.fetchSlotsForSelectedDate();
      }
    });

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.resolveProvider(params.get('name'));
    });

    this.store.select(selectAvailabilityLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.slotsLoading = loading);

    this.store.select(selectAvailableSlots)
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        if (!response) return;
        this.availabilityConfigured = response.availabilityConfigured;
        this.slots = response.slots ?? [];
        this.slotDurationMinutes = response.slotDurationMinutes ?? 60;
        this.minLeadTimeMinutes = response.leadTimeMinutes ?? 60;
        this.slotsMessage = response.message ?? '';
        this.selectedSlot = this.takePendingSlot();
      });

    this.actions$.pipe(ofType(createBookingSuccess), takeUntil(this.destroy$)).subscribe(({ response }) => {
      this.submitting = false;
      this.snackBar.openSnackBar(response?.data?.message || response?.message || 'Your booking request has been sent.', '');
      this.router.navigate(['/dashboard/my-tasks']);
    });

    this.actions$.pipe(ofType(createBookingFailure), takeUntil(this.destroy$)).subscribe(({ error }) => {
      this.submitting = false;
      this.snackBar.openSnackBar(error || genericError, 'error');
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(clearAvailableSlots());
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Resolution ───────────────────────────────────────────────────────────

  private resolveProvider(name: string | null): void {
    this.resolving = true;
    this.notFound = false;

    if (!name) {
      this.resolving = false;
      this.notFound = true;
      return;
    }

    const list$: Observable<ApiResponse<any[]> | null> = this.kind === 'trainer'
      ? this.trainerService.getActiveTrainers()
      : this.centerService.getActiveCenters();

    list$.pipe(take(1), catchError(() => of(null))).subscribe(response => {
      const providers = response?.data ?? [];
      const match = providers.find((p: any) => p.name?.replace(/ /g, '-').toLowerCase() === name.toLowerCase());

      this.resolving = false;

      if (!match) {
        this.notFound = true;
        return;
      }

      this.providerId = match.id;
      this.providerName = match.name;
      this.providerPhotoUrl = match.photoResponse?.photoUrl || null;

      this.updateSeoTags();
      this.fetchPackages();
      this.restoreGuestDraft();
      this.fetchSlotsForSelectedDate();
    });
  }

  /**
   * Back from sign-in / sign-up: put the day, time and notes the visitor had picked back, so the last step is
   * one tap. Only restored for a signed-in user (a guest reloading keeps their own tab state anyway).
   */
  private restoreGuestDraft(): boolean {
    if (!this.user?.email) return false;
    const draft = loadGuestDraft(this.kind, this.providerId);
    if (!draft) return false;
    clearGuestDraft();
    if (new Date(`${draft.date}T23:59:59`).getTime() < Date.now()) return false; // that day has passed
    this.selectedDate = draft.date;
    this.notes = draft.notes;
    this.pendingSlotStart = draft.slotStart;
    return true;
  }

  private takePendingSlot(): AvailableSlot | null {
    const wanted = this.pendingSlotStart;
    this.pendingSlotStart = null;
    if (!wanted) return null;
    return this.slots.find(s => s.startTime === wanted) ?? null;
  }

  private get shareUrl(): string {
    const slug = this.providerName.replace(/ /g, '-');
    const path = this.kind === 'trainer' ? `/trainers/${slug}/book` : `/centers/${slug}/book`;
    return `${environment.baseUrl}${path}`;
  }

  /** Native share sheet where the browser has one (phones), otherwise copy the link. */
  async share(): Promise<void> {
    const url = this.shareUrl;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Book ${this.providerName} | Berliz`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      this.snackBar.openSnackBar('Booking link copied', '');
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      this.snackBar.openSnackBar('Could not share the link', 'error');
    }
  }

  private updateSeoTags(): void {
    const url = this.shareUrl;
    this.seoService.updatePageData({
      title: `Book ${this.providerName} | Berliz`,
      description: `Book a session with ${this.providerName} on Berliz.`,
      imageUrl: this.providerPhotoUrl || `${environment.assetsUrl}berliz-site.png`,
      ogType: 'website',
    }, url);
  }

  private fetchPackages(): void {
    const pkgs$ = this.kind === 'trainer'
      ? this.providerPackageService.getForTrainer(this.providerId)
      : this.providerPackageService.getForCenter(this.providerId);

    pkgs$.pipe(take(1), catchError(() => of(null))).subscribe(res => {
      this.packages = (res?.data ?? []).filter(p => p.isActive);
    });

    if (!this.user?.email) return;

    this.subscriptionService.getMySubscriptions().pipe(take(1), catchError(() => of([]))).subscribe(subs => {
      const owned = new Map<number, Subscriptions>();
      for (const sub of subs ?? []) {
        const pkgId = sub.providerPackage?.id;
        if (pkgId == null || sub.status !== 'true') continue;
        const sameProvider = this.kind === 'trainer'
          ? (sub.trainer as any)?.id === this.providerId
          : (sub.center as any)?.id === this.providerId;
        if (sameProvider) owned.set(pkgId, sub);
      }
      this.ownedByPackageId = owned;
    });
  }

  // ── Option selection ─────────────────────────────────────────────────────

  chooseSingle(): void {
    this.selectedOption = { kind: 'single' };
  }

  choosePackage(pkg: ProviderPackage): void {
    const owned = this.ownedByPackageId.get(pkg.id);
    this.selectedOption = owned
      ? { kind: 'ownedPackage', subscription: owned }
      : { kind: 'buyPackage', pkg };
  }

  /** "Buy this package" — starts Stripe Checkout; booking itself happens in a later visit once it's paid/active. */
  buyPackage(pkg: ProviderPackage): void {
    if (this.buyingPackageId != null) return;
    if (!this.user?.email) {
      this.promptToSignIn();
      return;
    }

    this.buyingPackageId = pkg.id;
    this.subscriptionService.purchasePackage(pkg.id).subscribe({
      next: res => {
        const purchase = res?.data;
        if (!purchase?.subscriptionId) {
          this.buyingPackageId = null;
          this.snackBar.openSnackBar(res?.message || 'Could not start that purchase — try again.', 'error');
          return;
        }
        this.stripeService.createCheckoutSession({
          subscriptionId: purchase.subscriptionId,
          amount: purchase.price,
          currency: purchase.currency,
          productName: purchase.packageName,
        }).subscribe({
          next: checkoutRes => {
            const checkoutUrl = checkoutRes.data?.checkoutUrl;
            if (!checkoutUrl) {
              this.buyingPackageId = null;
              this.snackBar.openSnackBar('Could not start checkout — try again.', 'error');
              return;
            }
            window.location.href = checkoutUrl;
          },
          error: () => {
            this.buyingPackageId = null;
            this.snackBar.openSnackBar('Could not start checkout — try again.', 'error');
          }
        });
      },
      error: (err) => {
        this.buyingPackageId = null;
        this.snackBar.openSnackBar(err?.error?.message || 'Could not start that purchase — try again.', 'error');
      }
    });
  }

  // ── Slot picker ──────────────────────────────────────────────────────────

  selectDate(dateValue: string): void {
    if (this.selectedDate === dateValue) return;
    this.selectedDate = dateValue;
    this.selectedSlot = null;
    this.fetchSlotsForSelectedDate();
  }

  private fetchSlotsForSelectedDate(): void {
    if (!this.providerId) return;
    this.store.dispatch(loadAvailableSlots({
      trainerId: this.kind === 'trainer' ? this.providerId : undefined,
      centerId: this.kind === 'center' ? this.providerId : undefined,
      date: this.selectedDate
    }));
  }

  selectSlot(slot: AvailableSlot): void {
    this.selectedSlot = slot;
  }

  slotLabel(slot: AvailableSlot): string {
    const [hStr, mStr] = slot.startTime.split(':');
    let h = parseInt(hStr, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${mStr} ${suffix}`;
  }

  /** Only worth showing once a slot's window actually allows more than 1 person. */
  showsCapacity(slot: AvailableSlot): boolean {
    return !!slot.capacity && slot.capacity > 1;
  }

  private formatDateLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // ── Waitlist ─────────────────────────────────────────────────────────────

  get onWaitlistForSelectedDate(): boolean {
    return this.waitlistedDates.has(this.selectedDate);
  }

  /** "Tell me if a time opens up on this day" -- the provider's cancellations free slots; the client is emailed. */
  joinWaitlist(): void {
    if (this.waitlistBusy || this.onWaitlistForSelectedDate) return;
    if (this.isGuest) {
      this.promptToSignIn();
      return;
    }
    const date = this.selectedDate;
    this.waitlistBusy = true;
    this.waitlistService.join(
      this.kind === 'trainer' ? { trainerId: this.providerId } : { centerId: this.providerId },
      date,
    ).subscribe({
      next: res => {
        this.waitlistBusy = false;
        this.waitlistedDates.add(date);
        this.snackBar.openSnackBar(res?.data?.message || res?.message || "You're on the list. We'll let you know if a time opens up.", '');
      },
      error: err => {
        this.waitlistBusy = false;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      }
    });
  }

  // ── Guest hand-off ───────────────────────────────────────────────────────

  get isGuest(): boolean {
    return !this.user?.email;
  }

  /** Remember the pick, then let the visitor choose between logging in and creating an account. */
  promptToSignIn(): void {
    this.saveDraft();
    this.showAuthPrompt = true;
  }

  dismissAuthPrompt(): void {
    this.showAuthPrompt = false;
  }

  goToLogin(): void {
    this.saveDraft();
    this.authRedirect.goToLogin();
  }

  goToSignUp(): void {
    this.saveDraft();
    this.router.navigate(['/sign-up']);
  }

  private saveDraft(): void {
    const slug = this.providerName.replace(/ /g, '-');
    saveGuestDraft({
      kind: this.kind,
      providerId: this.providerId,
      date: this.selectedDate,
      slotStart: this.selectedSlot?.startTime ?? null,
      notes: (this.notes ?? '').slice(0, this.maxNotesLength),
      path: this.kind === 'trainer' ? `/trainers/${slug}/book` : `/centers/${slug}/book`,
    });
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  submit(): void {
    if (this.submitting) return;

    if (!this.selectedSlot) {
      this.snackBar.openSnackBar('Pick a date and an available time.', 'error');
      return;
    }

    if (!this.user?.email) {
      this.promptToSignIn();
      return;
    }

    if (this.locationSelection?.incomplete) {
      this.snackBar.openSnackBar('Enter the address or place you want to train at, or pick one of the listed locations.', 'error');
      return;
    }

    const scheduledAt = new Date(`${this.selectedDate}T${this.selectedSlot.startTime}`);
    if (isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < this.earliestBookableTime) {
      this.snackBar.openSnackBar(
        `Pick a slot at least ${this.minLeadTimeMinutes} minutes out — the provider needs time to confirm.`,
        'error'
      );
      this.selectedSlot = null;
      this.fetchSlotsForSelectedDate();
      return;
    }

    const payload: any = {
      id: null,
      trainerId: this.kind === 'trainer' ? this.providerId : null,
      centerId: this.kind === 'center' ? this.providerId : null,
      scheduledAt: scheduledAt.toISOString(),
      localDate: this.selectedDate,
      localTime: this.selectedSlot.startTime,
      durationMinutes: this.slotDurationMinutes,
      notes: (this.notes ?? '').trim(),
    };

    if (this.kind === 'trainer' && this.locationSelection) {
      payload.trainerLocationId = this.locationSelection.trainerLocationId;
      payload.customLocation = this.locationSelection.customLocation;
    }

    if (this.selectedOption.kind === 'ownedPackage') {
      payload.packageSubscriptionId = this.selectedOption.subscription.id;
    }

    this.submitting = true;
    this.store.dispatch(createBooking({ data: payload }));
  }
}
