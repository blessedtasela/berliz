import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import jwt_decode from 'jwt-decode';
import { Subject, takeUntil } from 'rxjs';

import { PaymentCode, PaymentCodeDiscountType, PaymentCodeRequest, PaymentCodeTargetType, PlanCodeRequest } from 'src/app/models/payment-code.model';
import { Users } from 'src/app/models/users.interface';
import { Booking, MyClientSummary } from 'src/app/models/booking.model';
import { ProviderPackage } from 'src/app/models/provider-package.model';
import { BookingService } from 'src/app/services/booking.service';
import { ProviderPackageService } from 'src/app/services/provider-package.service';
import { PaymentCodeService } from 'src/app/services/payment-code.service';
import { BypassCodeService, BypassCode } from 'src/app/services/bypass-code.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { selectUser } from 'src/app/state/user/user.selector';

type Tab = 'review' | 'requests' | 'codes' | 'new' | 'planCodes';

/**
 * Payment codes — one page, three roles, TWO separate code systems sharing it (PY-28/29/30, Nov
 * 20 2026): a booking/package/subscription bypass (this page's original purpose, below) AND a
 * Plan-tier bypass code (comped subscription, no booking/trainer involved -- "planCodes" tab).
 * They were built as genuinely separate backend systems (PaymentCodeRequest vs PlanCodeRequest/
 * BypassCode) with no admin UI ever built for the second one, even though its own notification
 * ("...Open bypass codes to send them one, or decline") told admins to come here for it. Kept as
 * one page rather than two, since that's exactly where admins are already told to look.
 * - Everyone: the codes issued to them (copy the code, see uses left and expiry) and the requests that concern them.
 * - Trainer / center: ask the administration for a code for a client, and forward or decline a code a client asked for.
 * - Super admin: review pending requests (approve with uses / validity, or reject), every code ever issued (revoke),
 *   and (planCodes tab) issue or decline a client's direct ask for a Plan-tier code.
 */
@Component({
  selector: 'app-payment-codes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './payment-codes.component.html'
})
export class PaymentCodesComponent implements OnInit, OnDestroy {

  user: Users | null = null;
  isSuperAdmin = false;
  tab: Tab = 'codes';
  loading = true;
  busyId: number | null = null;

  myCodes: PaymentCode[] = [];
  myRequests: PaymentCodeRequest[] = [];
  adminRequests: PaymentCodeRequest[] = [];
  adminCodes: PaymentCode[] = [];

  /** Plan-tier bypass codes (super admin only) -- a separate system from the booking/package codes above. */
  planRequests: PlanCodeRequest[] = [];
  bypassCodes: BypassCode[] = [];
  /** Per-request inputs while issuing a Plan code: how many months, how many redemptions (blank = unlimited), and a note. */
  planDecision: Record<number, { durationMonths: number; maxRedemptions: number | null; note: string }> = {};
  issuingPlanRequestId: number | null = null;

  /**
   * Per-request inputs while reviewing: how many uses, how many days, the note, and what the code
   * does -- discountType/discountValue only take effect for a BOOKING-target request; the admin
   * review form hides the picker for package/subscription requests, which stay full-bypass-only.
   */
  decision: Record<number, { uses: number; validDays: number; note: string; discountType: PaymentCodeDiscountType; discountValue: number | null }> = {};

  /** The provider's "ask the administration" form. */
  form: { targetType: PaymentCodeTargetType; bookingId: number | null; packageId: number | null; subscriptionId: number | null; clientId: number | null; uses: number; reason: string }
    = { targetType: 'BOOKING', bookingId: null, packageId: null, subscriptionId: null, clientId: null, uses: 1, reason: '' };
  sending = false;
  formError = '';

  /**
   * PY-30: a smart picker over the provider's own bookings/clients/packages instead of making them
   * type an id from memory -- recent first, searchable, manual id kept only as an explicit fallback.
   * Loaded once, lazily, the first time the 'new' tab is actually opened (not every page load).
   */
  myBookings: Booking[] = [];
  myClients: MyClientSummary[] = [];
  myPackages: ProviderPackage[] = [];
  private pickerDataLoaded = false;
  bookingQuery = '';
  clientQuery = '';
  packageQuery = '';
  showBookingPicker = false;
  showClientPicker = false;
  showPackagePicker = false;
  /** Manual-id entry is the explicit fallback -- hidden by default, one per target so switching targets doesn't carry the toggle over. */
  manualEntry: Record<PaymentCodeTargetType, boolean> = { BOOKING: false, PACKAGE: false, SUBSCRIPTION: false };

  private destroy$ = new Subject<void>();

  constructor(
    private codes: PaymentCodeService,
    private bypassCodeService: BypassCodeService,
    private store: Store,
    private snackBar: SnackBarService,
    private dialog: MatDialog,
    private bookingService: BookingService,
    private providerPackageService: ProviderPackageService,
  ) { }

  get isProvider(): boolean {
    const role = this.user?.role;
    return role === 'trainer' || role === 'center';
  }

  ngOnInit(): void {
    try {
      const token = localStorage.getItem('token');
      this.isSuperAdmin = !!token && (jwt_decode(token) as any)?.superAdmin === true;
    } catch { this.isSuperAdmin = false; }

    this.store.select(selectUser).pipe(takeUntil(this.destroy$)).subscribe(u => this.user = u);
    this.tab = this.isSuperAdmin ? 'review' : 'codes';
    this.reload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload(): void {
    this.loading = true;
    this.codes.myCodes().subscribe({ next: r => this.myCodes = r.data ?? [], error: () => this.myCodes = [] });
    this.codes.myRequests().subscribe({
      next: r => { this.myRequests = r.data ?? []; this.loading = false; },
      error: () => { this.myRequests = []; this.loading = false; }
    });
    if (this.isSuperAdmin) {
      this.codes.adminRequests().subscribe({
        next: r => {
          this.adminRequests = r.data ?? [];
          for (const req of this.adminRequests) {
            if (!this.decision[req.id]) this.decision[req.id] = { uses: req.usesRequested || 1, validDays: 14, note: '', discountType: 'FULL_BYPASS', discountValue: null };
          }
        }, error: () => this.adminRequests = []
      });
      this.codes.adminCodes().subscribe({ next: r => this.adminCodes = r.data ?? [], error: () => this.adminCodes = [] });
      this.bypassCodeService.getAllCodeRequests().subscribe({
        next: r => {
          this.planRequests = r.data ?? [];
          for (const req of this.planRequests) {
            if (!this.planDecision[req.id]) this.planDecision[req.id] = { durationMonths: 1, maxRedemptions: 1, note: '' };
          }
        }, error: () => this.planRequests = []
      });
      this.bypassCodeService.getAllBypassCodes().subscribe({ next: r => this.bypassCodes = r.data ?? [], error: () => this.bypassCodes = [] });
    }
  }

  get openPlanRequests(): PlanCodeRequest[] {
    return this.planRequests.filter(r => r.status === 'OPEN');
  }

  get closedPlanRequests(): PlanCodeRequest[] {
    return this.planRequests.filter(r => r.status !== 'OPEN');
  }

  /** Issues a Plan-tier code for this request's plan, then closes the request with the code in the decision note -- the
   *  backend keeps these as two separate calls (no automatic link between a request and a code), so this ties them together. */
  issuePlanCode(r: PlanCodeRequest): void {
    const d = this.planDecision[r.id];
    this.issuingPlanRequestId = r.id;
    this.bypassCodeService.addBypassCode({
      planId: r.planId, durationMonths: d.durationMonths, maxRedemptions: d.maxRedemptions, note: d.note || null,
    }).subscribe({
      next: created => {
        const code = created.data?.code;
        this.bypassCodeService.closeCodeRequest(r.id, code ? `Code sent: ${code}` : d.note).subscribe({
          next: () => {
            this.issuingPlanRequestId = null;
            this.snackBar.openSnackBar(code ? `Code ${code} created and the client was told` : 'Request closed', '');
            this.reload();
          },
          error: err => { this.issuingPlanRequestId = null; this.snackBar.openSnackBar(err?.error?.message || 'Code was created, but closing the request failed -- try again.', 'error'); }
        });
      },
      error: err => { this.issuingPlanRequestId = null; this.snackBar.openSnackBar(err?.error?.message || 'Could not create the code.', 'error'); }
    });
  }

  declinePlanRequest(r: PlanCodeRequest): void {
    this.issuingPlanRequestId = r.id;
    this.bypassCodeService.closeCodeRequest(r.id, this.planDecision[r.id]?.note || 'Declined').subscribe({
      next: () => { this.issuingPlanRequestId = null; this.snackBar.openSnackBar('Request declined', ''); this.reload(); },
      error: err => { this.issuingPlanRequestId = null; this.snackBar.openSnackBar(err?.error?.message || 'Could not decline the request.', 'error'); }
    });
  }

  toggleBypassCodeStatus(c: BypassCode): void {
    this.run(c.id, this.bypassCodeService.updateStatus(c.id), c.status === 'true' ? 'Code deactivated' : 'Code reactivated');
  }

  get pendingForAdmin(): PaymentCodeRequest[] {
    return this.adminRequests.filter(r => r.status === 'PENDING');
  }

  get decidedForAdmin(): PaymentCodeRequest[] {
    return this.adminRequests.filter(r => r.status !== 'PENDING');
  }

  /** Requests a client opened that this trainer still has to forward or decline. */
  get askedOfMe(): PaymentCodeRequest[] {
    return this.myRequests.filter(r => r.status === 'ASKED' && r.providerUserId === this.user?.id);
  }

  statusLabel(status: string): string {
    return ({
      ASKED: 'Waiting for the trainer', PENDING: 'With the administration', APPROVED: 'Approved',
      REJECTED: 'Rejected', CANCELLED: 'Withdrawn', ACTIVE: 'Ready to use', USED_UP: 'Used', EXPIRED: 'Expired', REVOKED: 'Cancelled'
    } as Record<string, string>)[status] ?? status;
  }

  statusClass(status: string): string {
    if (status === 'APPROVED' || status === 'ACTIVE') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    if (status === 'PENDING' || status === 'ASKED') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }

  copy(code: string | null): void {
    if (!code) return;
    navigator.clipboard?.writeText(code).then(
      () => this.snackBar.openSnackBar('Code copied', ''),
      () => this.snackBar.openSnackBar('Could not copy, select it and copy by hand', 'error'));
  }

  // ---- provider ----

  /** Switching what the code is for drops whatever was already picked -- a stale id from a different target must never be submitted. */
  onTargetTypeChange(): void {
    this.form.bookingId = null;
    this.form.packageId = null;
    this.form.subscriptionId = null;
    this.form.clientId = null;
    this.bookingQuery = '';
    this.clientQuery = '';
    this.packageQuery = '';
    this.showBookingPicker = false;
    this.showClientPicker = false;
    this.showPackagePicker = false;
  }

  /** Called when the "Ask for a code" tab is opened (isProvider only) -- loads the picker data once. */
  openNewTab(): void {
    this.tab = 'new';
    if (this.pickerDataLoaded) return;
    this.pickerDataLoaded = true;
    this.bookingService.getMyBookings().subscribe({ next: r => this.myBookings = r.data ?? [], error: () => this.myBookings = [] });
    this.bookingService.getMyClients().subscribe({ next: r => this.myClients = r.data ?? [], error: () => this.myClients = [] });
    this.providerPackageService.getMine().subscribe({ next: r => this.myPackages = r.data ?? [], error: () => this.myPackages = [] });
  }

  bookingLabel(b: Booking): string {
    const who = `${b.clientFirstname ?? ''} ${b.clientLastname ?? ''}`.trim() || b.clientEmail;
    const when = new Date(b.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${b.reference ?? '#' + b.id} · ${who} · ${when} · ${b.status}`;
  }

  clientLabel(c: MyClientSummary): string {
    return `${c.name} · ${c.email}`;
  }

  packageLabel(p: ProviderPackage): string {
    return `${p.name} · CA$${p.price.toFixed(2)}${p.sessionCount ? ' · ' + p.sessionCount + ' sessions' : ''}`;
  }

  /** Recent first when the box is empty; otherwise whatever matches, most recent first too. */
  get filteredBookings(): Booking[] {
    const q = this.bookingQuery.trim().toLowerCase();
    const sorted = [...this.myBookings].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
    const matches = q ? sorted.filter(b => this.bookingLabel(b).toLowerCase().includes(q)) : sorted;
    return matches.slice(0, 8);
  }

  get filteredClients(): MyClientSummary[] {
    const q = this.clientQuery.trim().toLowerCase();
    const matches = q ? this.myClients.filter(c => this.clientLabel(c).toLowerCase().includes(q)) : this.myClients;
    return matches.slice(0, 8);
  }

  get filteredPackages(): ProviderPackage[] {
    const q = this.packageQuery.trim().toLowerCase();
    const matches = q ? this.myPackages.filter(p => this.packageLabel(p).toLowerCase().includes(q)) : this.myPackages;
    return matches.slice(0, 8);
  }

  /** Closes a picker shortly after its input loses focus -- delayed so a click on a result (which blurs the
   *  input first) still registers before the list disappears. */
  hidePickerSoon(which: 'booking' | 'client' | 'package'): void {
    setTimeout(() => {
      if (which === 'booking') this.showBookingPicker = false;
      else if (which === 'client') this.showClientPicker = false;
      else this.showPackagePicker = false;
    }, 150);
  }

  pickBooking(b: Booking): void {
    this.form.bookingId = b.id;
    this.bookingQuery = this.bookingLabel(b);
    this.showBookingPicker = false;
  }

  pickClient(c: MyClientSummary): void {
    this.form.clientId = c.userId;
    this.clientQuery = this.clientLabel(c);
    this.showClientPicker = false;
  }

  pickPackage(p: ProviderPackage): void {
    this.form.packageId = p.id;
    this.packageQuery = this.packageLabel(p);
    this.showPackagePicker = false;
  }

  submitRequest(): void {
    this.formError = '';
    const f = this.form;
    if (!f.reason.trim()) { this.formError = 'Tell the administration why this client should not have to pay.'; return; }
    if (f.targetType === 'BOOKING' && !f.bookingId) { this.formError = 'Pick the booking (or enter its number).'; return; }
    if (f.targetType === 'PACKAGE' && (!f.packageId || !f.clientId)) { this.formError = 'Pick the package and the client (or enter their numbers).'; return; }
    if (f.targetType === 'SUBSCRIPTION' && !f.subscriptionId) { this.formError = 'Enter the purchase number.'; return; }

    this.sending = true;
    this.codes.request({
      targetType: f.targetType, bookingId: f.bookingId, packageId: f.packageId, subscriptionId: f.subscriptionId,
      clientId: f.clientId, uses: f.uses, reason: f.reason.trim(),
    }).subscribe({
      next: r => {
        this.sending = false;
        this.snackBar.openSnackBar(r.message || 'Request sent to the administration', '');
        this.form.reason = '';
        this.onTargetTypeChange();
        this.tab = 'requests';
        this.reload();
      },
      error: err => { this.sending = false; this.formError = err?.error?.message || 'Could not send the request.'; }
    });
  }

  forward(req: PaymentCodeRequest): void {
    this.run(req.id, this.codes.forward(req.id), 'Sent to the administration');
  }

  decline(req: PaymentCodeRequest): void {
    this.run(req.id, this.codes.decline(req.id), 'Request declined');
  }

  withdraw(req: PaymentCodeRequest): void {
    this.run(req.id, this.codes.cancel(req.id), 'Request withdrawn');
  }

  // ---- super admin ----

  approve(req: PaymentCodeRequest): void {
    const d = this.decision[req.id];
    // The discount picker only applies to a BOOKING-target request (packages/subscriptions stay
    // full-bypass-only, matching what the backend accepts) -- never send one for anything else.
    const isBooking = req.targetType === 'BOOKING';
    this.run(req.id, this.codes.approve(req.id, {
      uses: d.uses, validDays: d.validDays, note: d.note,
      discountType: isBooking ? d.discountType : 'FULL_BYPASS',
      discountValue: isBooking && d.discountType !== 'FULL_BYPASS' ? d.discountValue : null,
    }), 'Approved: the code was sent to the trainer and the client');
  }

  reject(req: PaymentCodeRequest): void {
    this.run(req.id, this.codes.reject(req.id, { note: this.decision[req.id]?.note }), 'Rejected: both were told');
  }

  revoke(code: PaymentCode): void {
    this.dialog.open(PromptModalComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Cancel this code?',
        message: 'It can no longer be used.',
        confirmText: 'Cancel code',
        cancelText: 'Keep it',
        icon: 'alert-triangle'
      }
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.run(code.id, this.codes.revoke(code.id), 'Code cancelled');
    });
  }

  private run(id: number, call: import('rxjs').Observable<{ message?: string }>, okMessage: string): void {
    this.busyId = id;
    call.subscribe({
      next: r => { this.busyId = null; this.snackBar.openSnackBar(r?.message || okMessage, ''); this.reload(); },
      error: err => { this.busyId = null; this.snackBar.openSnackBar(err?.error?.message || 'Something went wrong, try again.', 'error'); }
    });
  }
}
