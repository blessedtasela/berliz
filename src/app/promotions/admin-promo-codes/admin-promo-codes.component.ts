import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { Plan } from 'src/app/models/plan.model';
import { DiscountCode, DiscountCodeRequest, DiscountCodeService } from 'src/app/services/discount-code.service';
import { PlanService } from 'src/app/services/plan.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Admin: promo codes for plan checkout -- a percentage or fixed amount off a plan's first payment, applied
 * server-side as a one-time Stripe coupon. A code can be limited to one plan, to every plan for a role, or left open
 * to all. (Codes that give a plan away with no payment are bypass codes -- a separate mechanism.)
 */
@Component({
  selector: 'app-admin-promo-codes',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IconsModule],
  templateUrl: './admin-promo-codes.component.html',
})
export class AdminPromoCodesComponent implements OnInit {

  codes: DiscountCode[] = [];
  plans: Plan[] = [];
  loading = true;
  loadFailed = false;
  creating = false;
  showForm = false;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private discountService: DiscountCodeService,
    private planService: PlanService,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      code: [''],
      discountType: ['percentage', Validators.required],
      value: [null as number | null, [Validators.required, Validators.min(0.01)]],
      scope: ['all'],            // 'all' | 'role' | 'plan'
      targetRole: ['client'],
      planId: [null as number | null],
      maxRedemptions: [null as number | null, Validators.min(1)],
      expiresAt: [''],
      note: [''],
    });
    this.load();
    this.planService.getActivePlans().pipe(take(1)).subscribe({
      next: (res: any) => { this.plans = (res?.data ?? []).filter((p: Plan) => (p.price ?? 0) > 0); },
      error: () => { this.plans = []; },
    });
  }

  load(): void {
    this.loading = true;
    this.loadFailed = false;
    this.discountService.getAll().pipe(take(1)).subscribe({
      next: res => { this.codes = res?.data ?? []; this.loading = false; },
      error: () => { this.loading = false; this.loadFailed = true; },
    });
  }

  get isPercentage(): boolean { return this.form.value.discountType === 'percentage'; }

  /** The server rejects a percentage outside 1-99 and a fixed amount at or below zero; catch it before sending. */
  get valueError(): string | null {
    const v = Number(this.form.value.value);
    if (this.form.get('value')?.pristine && !this.form.get('value')?.touched) return null;
    if (!v || v <= 0) return 'Enter an amount greater than zero.';
    if (this.isPercentage && v > 99) return 'A percentage must be between 1 and 99 (100% is a bypass code).';
    return null;
  }

  get canCreate(): boolean {
    if (this.creating || this.form.invalid || this.valueError) return false;
    return !(this.form.value.scope === 'plan' && !this.form.value.planId);
  }

  create(): void {
    if (!this.canCreate) return;
    const v = this.form.value;
    const request: DiscountCodeRequest = {
      code: (v.code ?? '').trim() || null,
      discountType: v.discountType,
      value: Number(v.value),
      planId: v.scope === 'plan' ? Number(v.planId) : null,
      targetRole: v.scope === 'role' ? v.targetRole : null,
      maxRedemptions: v.maxRedemptions ? Number(v.maxRedemptions) : null,
      expiresAt: v.expiresAt || null,
      note: (v.note ?? '').trim() || null,
    };
    this.creating = true;
    this.discountService.add(request).pipe(take(1)).subscribe({
      next: res => {
        this.creating = false;
        this.snackBar.openSnackBar(res?.message || 'Promo code created', '');
        this.form.reset({ code: '', discountType: 'percentage', value: null, scope: 'all', targetRole: 'client', planId: null, maxRedemptions: null, expiresAt: '', note: '' });
        this.showForm = false;
        this.load();
      },
      error: err => {
        this.creating = false;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      },
    });
  }

  toggle(code: DiscountCode): void {
    this.discountService.toggle(code.id).pipe(take(1)).subscribe({
      next: res => { this.snackBar.openSnackBar(res?.message || 'Updated', ''); this.load(); },
      error: err => this.snackBar.openSnackBar(err?.error?.message || genericError, 'error'),
    });
  }

  isActive(code: DiscountCode): boolean { return String(code.status).toLowerCase() === 'true'; }

  isExpired(code: DiscountCode): boolean {
    return !!code.expiresAt && new Date(code.expiresAt).getTime() < Date.now();
  }

  isUsedUp(code: DiscountCode): boolean {
    return code.maxRedemptions != null && code.redemptionCount >= code.maxRedemptions;
  }

  /** "20% off" / "$15 off". */
  label(code: DiscountCode): string {
    return code.discountType === 'percentage' ? `${code.value}% off` : `$${code.value} off`;
  }

  /** What the code can be used on. */
  scope(code: DiscountCode): string {
    if (code.planName) return `${code.planName} plan only`;
    if (code.targetRole) return `${code.targetRole} plans`;
    return 'Any paid plan';
  }
}
