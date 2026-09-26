import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, Subject, catchError, of, take, takeUntil } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { DateStripComponent } from 'src/app/shared/date-strip/date-strip.component';

import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { CenterService } from 'src/app/services/center.service';
import { ProviderPackageService } from 'src/app/services/provider-package.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { StripeService } from 'src/app/services/stripe.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SeoService } from 'src/app/services/seo.service';
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
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconsModule, DateStripComponent],
  templateUrl: './booking-page.component.html',
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
  readonly maxNotesLength = 500;

  submitting = false;

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
    this.store.select(selectUser).pipe(takeUntil(this.destroy$)).subscribe(user => this.user = user);

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
        this.selectedSlot = null;
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
      this.fetchSlotsForSelectedDate();

      if (!this.user?.email) {
        // A shared link should still resolve and show the provider/page shell
        // (so it's clear what they're being asked to log in for) before
        // sending them on -- not bounce them to /login with zero context.
        this.authRedirect.goToLogin();
      }
    });
  }

  private updateSeoTags(): void {
    const slug = this.providerName.replace(/ /g, '-');
    const path = this.kind === 'trainer' ? `/trainers/${slug}/book` : `/centers/${slug}/book`;
    const url = `${environment.baseUrl}${path}`;
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
      this.authRedirect.goToLogin();
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

  // ── Submit ───────────────────────────────────────────────────────────────

  submit(): void {
    if (this.submitting) return;

    if (!this.user?.email) {
      this.authRedirect.goToLogin();
      return;
    }

    if (!this.selectedSlot) {
      this.snackBar.openSnackBar('Pick a date and an available time.', 'error');
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

    if (this.selectedOption.kind === 'ownedPackage') {
      payload.packageSubscriptionId = this.selectedOption.subscription.id;
    }

    this.submitting = true;
    this.store.dispatch(createBooking({ data: payload }));
  }
}
