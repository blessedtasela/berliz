import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { PromotionService } from 'src/app/services/promotion.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromoOffer } from 'src/app/models/promo-offer.model';
import { genericError } from 'src/validators/form-validators.module';

export interface PromotionFormModalData {
  /** Present when editing an existing promotion; absent when creating a new one. */
  promotion?: PromoOffer;
}

/**
 * Create/edit form for a PromoOffer -- used both by a trainer/center managing
 * their own profile offers, and by an admin managing platform campaigns
 * (same shape, same endpoint; the backend decides ownership from who's
 * calling it, not from anything this form sends).
 */
@Component({
  selector: 'app-promotion-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule],
  templateUrl: './promotion-form-modal.component.html',
  styleUrls: ['./promotion-form-modal.component.css']
})
export class PromotionFormModalComponent {

  form: FormGroup;
  invalidForm = false;
  saving = false;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    private promotionService: PromotionService,
    private snackBar: SnackBarService,
    public dialogRef: MatDialogRef<PromotionFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PromotionFormModalData,
  ) {
    this.isEdit = !!data?.promotion;
    const p = data?.promotion;

    this.form = this.fb.group({
      title: [p?.title ?? '', [Validators.required, Validators.maxLength(120)]],
      description: [p?.description ?? ''],
      type: [p?.type ?? 'percentage', Validators.required],
      value: [p?.value ?? null],
      audience: [p?.audience ?? 'everyone'],
      startDate: [this.toDateInput(p?.startDate)],
      endDate: [this.toDateInput(p?.endDate)],
      usageLimit: [p?.usageLimit ?? null],
    });
  }

  get needsValue(): boolean {
    const type = this.form.get('type')?.value;
    return type === 'percentage' || type === 'fixed';
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    if (this.saving) return;

    if (this.form.invalid) {
      this.invalidForm = true;
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const payload = {
      title: value.title,
      description: value.description || null,
      type: value.type,
      value: this.needsValue && value.value !== null && value.value !== '' ? Number(value.value) : null,
      audience: value.audience || null,
      startDate: value.startDate ? new Date(value.startDate).toISOString() : null,
      endDate: value.endDate ? new Date(value.endDate).toISOString() : null,
      usageLimit: value.usageLimit !== null && value.usageLimit !== '' ? Number(value.usageLimit) : null,
    };

    this.invalidForm = false;
    this.saving = true;

    const request$ = this.isEdit
      ? this.promotionService.update(this.data.promotion!.id, payload)
      : this.promotionService.create(payload);

    request$.pipe(take(1)).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.snackBar.openSnackBar(res?.message || (this.isEdit ? 'Promotion updated' : 'Promotion created'), '');
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.saving = false;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      }
    });
  }

  private toDateInput(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  }
}
