import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import jwt_decode from 'jwt-decode';
import { Subject, takeUntil } from 'rxjs';

import { PaymentCode, PaymentCodeDiscountType, PaymentCodeRequest, PaymentCodeTargetType } from 'src/app/models/payment-code.model';
import { Users } from 'src/app/models/users.interface';
import { PaymentCodeService } from 'src/app/services/payment-code.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { selectUser } from 'src/app/state/user/user.selector';

type Tab = 'review' | 'requests' | 'codes' | 'new';

/**
 * Payment codes — one page, three roles.
 * - Everyone: the codes issued to them (copy the code, see uses left and expiry) and the requests that concern them.
 * - Trainer / center: ask the administration for a code for a client, and forward or decline a code a client asked for.
 * - Super admin: review pending requests (approve with uses / validity, or reject) and every code ever issued (revoke).
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

  private destroy$ = new Subject<void>();

  constructor(private codes: PaymentCodeService, private store: Store, private snackBar: SnackBarService, private dialog: MatDialog) { }

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
    }
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

  submitRequest(): void {
    this.formError = '';
    const f = this.form;
    if (!f.reason.trim()) { this.formError = 'Tell the administration why this client should not have to pay.'; return; }
    if (f.targetType === 'BOOKING' && !f.bookingId) { this.formError = 'Enter the booking number.'; return; }
    if (f.targetType === 'PACKAGE' && (!f.packageId || !f.clientId)) { this.formError = 'Enter the package number and the client number.'; return; }
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
