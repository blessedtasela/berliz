import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { IconsModule } from 'src/app/icons/icons.module';
import { Categories } from 'src/app/models/categories.interface';
import { CenterEquipment } from 'src/app/models/centers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { addCenterEquipment, updateCenterEquipment } from 'src/app/state/center/center.actions';

export interface EquipmentFormData {
  mode: 'add' | 'edit';
  equipment?: CenterEquipment;
  categories: Categories[];
}

/**
 * Add / edit form for a center's own equipment.
 *
 * Standalone so it can live next to the page that opens it without having to be
 * registered in `DashboardModule`. The backend binds `@ModelAttribute
 * EquipmentRequest`, so the payload goes out as `FormData` with `categoryIds`
 * as a comma-separated string — same shape the admin center forms use.
 */
@Component({
  selector: 'app-equipment-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule],
  templateUrl: './equipment-form-modal.component.html',
  styleUrls: ['./equipment-form-modal.component.css']
})
export class EquipmentFormModalComponent implements OnInit {

  form!: FormGroup;
  invalidForm = false;

  categories: Categories[] = [];
  selectedCategoryIds: number[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: EquipmentFormData,
    public dialogRef: MatDialogRef<EquipmentFormModalComponent>,
    private formBuilder: FormBuilder,
    private store: Store,
    private snackbar: SnackBarService
  ) { }

  get isEdit(): boolean {
    return this.dialogData?.mode === 'edit';
  }

  ngOnInit(): void {
    const equipment = this.dialogData?.equipment;
    this.categories = this.dialogData?.categories ?? [];
    this.selectedCategoryIds = [...(equipment?.categoryIds ?? [])];

    this.form = this.formBuilder.group({
      name: [equipment?.name ?? '', [Validators.required, Validators.minLength(2)]],
      description: [equipment?.description ?? '', [Validators.required, Validators.minLength(10)]],
      stockNumber: [equipment?.stockNumber ?? 1, [Validators.required, Validators.min(0)]],
      imageUrl: [equipment?.imageUrl ?? '', [Validators.required]],
      frontViewUrl: [equipment?.frontViewUrl ?? '', [Validators.required]],
      sideViewUrl: [equipment?.sideViewUrl ?? '', [Validators.required]],
      rearViewUrl: [equipment?.rearViewUrl ?? '', [Validators.required]]
    });
  }

  // ── Category chips ──────────────────────────────────────────────────────────

  isCategorySelected(id: number): boolean {
    return this.selectedCategoryIds.includes(id);
  }

  toggleCategory(id: number): void {
    this.selectedCategoryIds = this.isCategorySelected(id)
      ? this.selectedCategoryIds.filter(selected => selected !== id)
      : [...this.selectedCategoryIds, id];
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  save(): void {
    if (this.form.invalid || this.selectedCategoryIds.length === 0) {
      this.invalidForm = true;
      this.snackbar.openSnackBar('Invalid form — fill every field and pick at least one discipline', 'error');
      return;
    }

    this.invalidForm = false;

    const data = new FormData();
    if (this.isEdit && this.dialogData.equipment) {
      data.append('id', String(this.dialogData.equipment.id));
      data.append('centerId', String(this.dialogData.equipment.centerId));
    }
    data.append('name', this.form.get('name')?.value);
    data.append('description', this.form.get('description')?.value);
    data.append('stockNumber', String(this.form.get('stockNumber')?.value));
    data.append('imageUrl', this.form.get('imageUrl')?.value);
    data.append('frontViewUrl', this.form.get('frontViewUrl')?.value);
    data.append('sideViewUrl', this.form.get('sideViewUrl')?.value);
    data.append('rearViewUrl', this.form.get('rearViewUrl')?.value);
    data.append('categoryIds', this.selectedCategoryIds.join(','));

    this.store.dispatch(
      this.isEdit ? updateCenterEquipment({ data }) : addCenterEquipment({ data })
    );

    this.snackbar.openSnackBar(this.isEdit ? 'Updating equipment…' : 'Adding equipment…', '');
    this.dialogRef.close(true);
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}
