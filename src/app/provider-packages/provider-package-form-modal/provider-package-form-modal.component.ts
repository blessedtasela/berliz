import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { ProviderPackageService } from 'src/app/services/provider-package.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ProviderPackage } from 'src/app/models/provider-package.model';
import { genericError } from 'src/validators/form-validators.module';

export interface ProviderPackageFormModalData {
  /** Present when editing an existing package; absent when creating a new one. */
  pkg?: ProviderPackage;
}

/** Create/edit form for a trainer/center's own sellable package. */
@Component({
  selector: 'app-provider-package-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule],
  templateUrl: './provider-package-form-modal.component.html',
  styleUrls: ['./provider-package-form-modal.component.css']
})
export class ProviderPackageFormModalComponent {

  form: FormGroup;
  invalidForm = false;
  saving = false;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    private packageService: ProviderPackageService,
    private snackBar: SnackBarService,
    public dialogRef: MatDialogRef<ProviderPackageFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProviderPackageFormModalData,
  ) {
    this.isEdit = !!data?.pkg;
    const p = data?.pkg;

    this.form = this.fb.group({
      name: [p?.name ?? '', [Validators.required, Validators.maxLength(120)]],
      description: [p?.description ?? ''],
      // Unchecked = time-based/unlimited (sessionCount null); checked exposes the count field.
      isBundle: [p ? p.sessionCount != null : true],
      sessionCount: [p?.sessionCount ?? 5, [Validators.min(1)]],
      price: [p?.price ?? null, [Validators.required, Validators.min(0.01)]],
      durationDays: [p?.durationDays ?? null, [Validators.min(1)]],
      groupSize: [p?.groupSize ?? 1, [Validators.required, Validators.min(1)]],
      billingType: [p?.billingType ?? 'ONE_TIME', Validators.required],
      isActive: [p?.isActive ?? true],
    });
  }

  get isBundle(): boolean {
    return !!this.form.get('isBundle')?.value;
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
      name: value.name.trim(),
      description: value.description || null,
      sessionCount: this.isBundle && value.sessionCount ? Number(value.sessionCount) : null,
      price: Number(value.price),
      durationDays: value.durationDays ? Number(value.durationDays) : null,
      groupSize: Number(value.groupSize),
      billingType: value.billingType,
      isActive: value.isActive,
    };

    this.invalidForm = false;
    this.saving = true;

    const request$ = this.isEdit
      ? this.packageService.update(this.data.pkg!.id, payload)
      : this.packageService.create(payload);

    request$.pipe(take(1)).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.snackBar.openSnackBar(res?.message || (this.isEdit ? 'Package updated' : 'Package created'), '');
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.saving = false;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      }
    });
  }
}
