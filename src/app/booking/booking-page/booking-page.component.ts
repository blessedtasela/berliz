import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProviderContactComponent } from '../../shared/provider-profile/provider-contact.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, catchError, of, take, takeUntil } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { DateStripComponent } from 'src/app/shared/date-strip/date-strip.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BookingLocationPickerComponent, BookingLocationSelection, locationPayload } from '../booking-location-picker/booking-location-picker.component';
import { BookingPriceEstimateComponent } from '../booking-price-estimate/booking-price-estimate.component';

import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { CenterService } from 'src/app/services/center.service';
import { ProviderPackageService } from 'src/app/services/provider-package.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SeoService } from 'src/app/services/seo.service';
import { WaitlistService } from 'src/app/services/waitlist.service';
import { clearGuestDraft, loadGuestDraft, saveGuestDraft } from '../guest-booking-draft';
import { ProviderKind, providerSlug, resolveProviderBySlug } from '../resolve-provider';
import { environment } from 'src/environments/environment';

import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { createBooking, createBookingFailure, createBookingSuccess } from 'src/app/state/booking/booking.actions';
import { clearAvailableSlots, loadAvailableSlots } from 'src/app/state/availability/availability.actions';
import { selectAvailabilityLoading, selectAvailableSlots } from 'src/app/state/availability/availability.selectors';

import { AvailableSlot } from 'src/app/models/availability.model';
import { ProviderPackage } from 'src/app/models/provider-package.model';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { Users } from 'src/app/models/users.interface';
import { genericError } from 'src/validators/form-validators.module';
import { PLAN_KIND_LABEL, planKind } from 'src/app/utils/provider-package.util';
import { memoized, newMemoSlot } from 'src/app/utils/memo';

/** What the client has chosen to book with, right now. */
type BookingOption =
  | { kind: 'single' }
  | { kind: 'ownedPackage'; subscription: Subscriptions };

/**
 * The booking page — `/trainers/:name/book` and `/centers/:name/book`. A real, shareable page (not a
 * pop-up) that works for a visitor who is not signed in yet, for booking a session:
 *  - single session: pick a time, send a request, the provider confirms, then you pay (Bookings)
 *  - a session out of a plan you own: pick a time and book it from the pack (Bookings, tagged as from the pack)
 *
 * Buying a plan (subscription / session pack / membership) is the Level Up page's job
 * (`/level-up`, see LevelUpPageComponent). An old `?plan=<id>` link for a plan you don't own is sent
 * there; for a plan you do own it opens the page with that plan selected.
 */
@Component({
    selector: 'app-booking-page',
    imports: [CommonModule, FormsModule, RouterModule, IconsModule, SharedModule, DateStripComponent, BookingLocationPickerComponent, BookingPriceEstimateComponent, ProviderContactComponent],
    templateUrl: './booking-page.component.html'
})
export class BookingPageComponent implements OnInit, OnDestroy {

  /** Set via route `data: { kind: 'trainer' | 'center' }` -- see trainers-feature.module.ts / centers-feature.module.ts. */
  kind: ProviderKind = 'trainer';

  resolving = true;
  notFound = false;

  providerId = 0;
  providerName = '';
  /** The provider's published contact details, offered when they have no hours to book into. */
  contactEmail: string | null = null;
  contactPhone: string | null = null;
  providerPhotoUrl: string | null = null;

  /** What this provider sells (only used to point at the Level Up page, which is where plans are bought). */
  packages: ProviderPackage[] = [];
  /** This client's own ACTIVE purchases of one of this provider's packages, keyed by providerPackage id. */
  ownedByPackageId = new Map<number, Subscriptions>();

  selectedOption: BookingOption = { kind: 'single' };
  /** The plan the link asked for (`?plan=`); used once the provider's plans have loaded. */
  private pendingPlanId: number | null = null;
  private packagesLoaded = false;
  /** Whether we know yet which plans the signed-in client owns (a guest owns none, so never waits on this). */
  private ownedLoaded = false;

  readonly kindLabel = (pkg: ProviderPackage) => PLAN_KIND_LABEL[planKind(pkg)];

  // ── Slot picker ──────────────────────────────────────────────────────────
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
  /** Inline message above the submit button: validation problems and failed submits (e.g. slot taken) -- stays until fixed/dismissed so the client can pick another time. */
  submitError: string | null = null;

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
    private authRedirect: AuthRedirectService,
    private snackBar: SnackBarService,
    private seoService: SeoService,
    private waitlistService: WaitlistService,
  ) { }

  private get earliestBookableTime(): number {
    return Date.now() + this.minLeadTimeMinutes * 60_000;
  }

  // Read on every change-detection pass: cached per slot list, day and minute (the lead-time cutoff moves with the clock).
  private visibleSlotsMemo = newMemoSlot<AvailableSlot[]>();

  get visibleSlots(): AvailableSlot[] {
    return memoized(this.visibleSlotsMemo,
      [this.slots, this.selectedDate, this.minLeadTimeMinutes, Math.floor(Date.now() / 60_000)], () => {
        const cutoff = this.earliestBookableTime;
        return this.slots.filter(s => {
          const start = new Date(`${this.selectedDate}T${s.startTime}`).getTime();
          return isNaN(start) || start >= cutoff;
        });
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

  /** The plans this client already has with this provider, to book a session out of. */
  get ownedPlans(): Subscriptions[] {
    return Array.from(this.ownedByPackageId.values());
  }

  isPackageSelected(subscription: Subscriptions): boolean {
    return this.selectedOption.kind === 'ownedPackage' && this.selectedOption.subscription.id === subscription.id;
  }

  /** The owned plan a session would be booked out of, when that's what is selected. */
  get ownedPlan(): Subscriptions | null {
    return this.selectedOption.kind === 'ownedPackage' ? this.selectedOption.subscription : null;
  }

  /** The main button says what it will do: request a session, or book it from your pack. */
  get primaryLabel(): string {
    if (this.submitting) return 'Sending…';
    if (this.ownedPlan) return this.isGuest ? 'Continue' : 'Book with your pack';
    return this.isGuest ? 'Continue' : 'Request booking';
  }

  get primaryIcon(): string {
    return this.submitting ? 'loader' : 'send';
  }

  get primaryDisabled(): boolean {
    return this.submitting || this.availabilityConfigured !== true;
  }

  /** Where plans are bought: this provider's Level Up page. */
  get levelUpPath(): string[] {
    return [this.kind === 'trainer' ? '/trainers' : '/centers', providerSlug(this.providerName), 'level-up'];
  }

  ngOnInit(): void {
    const planParam = Number(this.route.snapshot.queryParamMap.get('plan'));
    this.pendingPlanId = Number.isFinite(planParam) && planParam > 0 ? planParam : null;
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
        // An answer for a different day than the one on screen is stale: never show another day's times.
        if (response.date && this.selectedDate && response.date !== this.selectedDate) return;
        this.availabilityConfigured = response.availabilityConfigured;
        this.slots = response.slots ?? [];
        this.slotDurationMinutes = response.slotDurationMinutes ?? 60;
        this.minLeadTimeMinutes = response.leadTimeMinutes ?? 60;
        this.slotsMessage = response.message ?? '';
        this.selectedSlot = this.takePendingSlot();
      });

    this.actions$.pipe(ofType(createBookingSuccess), takeUntil(this.destroy$)).subscribe(({ response }) => {
      this.submitting = false;
      this.submitError = null;
      this.snackBar.openSnackBar(response?.data?.message || response?.message || 'Your booking request has been sent.', '');
      this.router.navigate(['/dashboard/my-tasks']);
    });

    this.actions$.pipe(ofType(createBookingFailure), takeUntil(this.destroy$)).subscribe(({ error }) => {
      this.submitting = false;
      this.submitError = error || genericError;
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

    resolveProviderBySlug(this.kind, name, this.trainerService, this.centerService)
      .pipe(take(1))
      .subscribe(provider => {
        this.resolving = false;

        if (!provider) {
          this.notFound = true;
          return;
        }

        this.providerId = provider.id;
        this.providerName = provider.name;
        this.providerPhotoUrl = provider.photoUrl;
        this.contactEmail = provider.contactEmail ?? null;
        this.contactPhone = provider.contactPhone ?? null;

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
      this.packagesLoaded = true;
      this.preselectPlan();
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
      this.ownedLoaded = true;
      this.preselectPlan();
    });
  }

  /**
   * Acts on the plan the link named (once, so a later pick sticks): a plan you own opens selected here, so
   * the session comes out of it; a plan you don't own is bought on the Level Up page, so the link goes there
   * (replacing this URL, so Back doesn't bounce).
   */
  private preselectPlan(): void {
    const id = this.pendingPlanId;
    if (id == null || !this.packagesLoaded) return;
    if (this.user?.email && !this.ownedLoaded) return;

    this.pendingPlanId = null;
    const owned = this.ownedByPackageId.get(id);
    if (owned) {
      this.selectedOption = { kind: 'ownedPackage', subscription: owned };
    } else if (this.packages.some(p => p.id === id)) {
      this.router.navigate(this.levelUpPath, { queryParams: { plan: id }, replaceUrl: true });
    }
  }

  // ── Option selection ─────────────────────────────────────────────────────

  chooseSingle(): void {
    this.selectedOption = { kind: 'single' };
  }

  chooseOwnedPlan(subscription: Subscriptions): void {
    this.selectedOption = { kind: 'ownedPackage', subscription };
  }

  // ── Slot picker ──────────────────────────────────────────────────────────

  selectDate(dateValue: string): void {
    if (this.selectedDate === dateValue) return;
    this.selectedDate = dateValue;
    this.selectedSlot = null;
    this.slots = [];
    this.submitError = null;
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
    this.submitError = null;
  }

  slotLabel(slot: AvailableSlot): string {
    const [hStr, mStr] = slot.startTime.split(':');
    let h = parseInt(hStr, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${mStr} ${suffix}`;
  }

  /** "Saturday, October 24 · 7:00 PM - 8:00 PM" for the booking summary, or null until a time is picked. */
  get summaryWhen(): string | null {
    if (!this.selectedSlot || !this.selectedDate) return null;
    const day = new Date(this.selectedDate + 'T12:00:00');
    const dayText = isNaN(day.getTime())
      ? this.selectedDate
      : day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    return `${dayText} · ${this.slotLabel(this.selectedSlot)} - ${this.slotLabel({ ...this.selectedSlot, startTime: this.selectedSlot.endTime })}`;
  }

  /** Where the session happens, for the summary: the chosen spot, or the center itself. */
  get summaryWhere(): string | null {
    return this.locationSelection?.label || (this.kind === 'center' ? this.providerName || null : null);
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
      path: (this.kind === 'trainer' ? `/trainers/${slug}/book` : `/centers/${slug}/book`)
        + (this.ownedPlan?.providerPackage ? `?plan=${this.ownedPlan.providerPackage.id}` : ''),
    });
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  submit(): void {
    if (this.submitting) return;
    this.submitError = null;

    if (!this.selectedSlot) {
      this.submitError = 'Pick a date and an available time.';
      return;
    }

    if (!this.user?.email) {
      this.promptToSignIn();
      return;
    }

    if (this.locationSelection?.incomplete) {
      this.submitError = 'Enter the address or place you want to train at, or pick one of the listed locations.';
      return;
    }

    const scheduledAt = new Date(`${this.selectedDate}T${this.selectedSlot.startTime}`);
    if (isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < this.earliestBookableTime) {
      this.selectedSlot = null;
      this.fetchSlotsForSelectedDate();
      this.submitError = `Pick a slot at least ${this.minLeadTimeMinutes} minutes out — the provider needs time to confirm.`;
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
      Object.assign(payload, locationPayload(this.locationSelection));
    }

    if (this.selectedOption.kind === 'ownedPackage') {
      payload.packageSubscriptionId = this.selectedOption.subscription.id;
    }

    this.submitting = true;
    this.store.dispatch(createBooking({ data: payload }));
  }
}
