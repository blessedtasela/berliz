import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { CenterService } from 'src/app/services/center.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Centers, CenterEquipment } from 'src/app/models/centers.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';
import { genericError, imageValidator } from 'src/validators/form-validators.module';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';

export interface EquipmentModalData {
  equipment?: CenterEquipment;
}

/** The four image slots this form uploads, each backed by its own form control of the same name. */
export const EQUIPMENT_IMAGE_FIELDS = ['imageUrl', 'frontViewUrl', 'sideViewUrl', 'rearViewUrl'] as const;
export type EquipmentImageField = typeof EQUIPMENT_IMAGE_FIELDS[number];

/**
 * Admin add/edit equipment modal. Owner (center or trainer) is picked only
 * when adding — the backend doesn't support reassigning an existing item's
 * owner on update, matching how self-service editing already works.
 */
@Component({
  selector: 'app-equipment-modal',
  standalone: true,
  imports: [ClickablePhotoDirective, CommonModule, ReactiveFormsModule, IconsModule, StrapiUrlPipe],
  templateUrl: './equipment-modal.component.html',
  styleUrls: ['./equipment-modal.component.css']
})
export class EquipmentModalComponent implements OnInit {

  form!: FormGroup;
  invalidForm = false;
  saving = false;

  centers: Centers[] = [];
  trainers: Trainers[] = [];

  /** Per-image-field upload state, keyed by form control name. */
  uploading: Record<EquipmentImageField, boolean> = {
    imageUrl: false, frontViewUrl: false, sideViewUrl: false, rearViewUrl: false
  };
  uploadError: Record<EquipmentImageField, string | null> = {
    imageUrl: null, frontViewUrl: null, sideViewUrl: null, rearViewUrl: null
  };

  readonly imageFields = EQUIPMENT_IMAGE_FIELDS;

  get isEdit(): boolean {
    return !!this.data?.equipment;
  }

  constructor(
    private fb: FormBuilder,
    private centerService: CenterService,
    private trainerService: TrainerService,
    private strapiService: StrapiService,
    private snackBar: SnackBarService,
    public dialogRef: MatDialogRef<EquipmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EquipmentModalData,
  ) { }

  ngOnInit(): void {
    const eq = this.data?.equipment;

    this.form = this.fb.group({
      ownerType: [eq ? (eq.trainerId ? 'trainer' : 'center') : 'center', Validators.required],
      centerId: [eq?.centerId ?? null],
      trainerId: [eq?.trainerId ?? null],
      name: [eq?.name ?? '', [Validators.required, Validators.minLength(3)]],
      description: [eq?.description ?? '', [Validators.required, Validators.minLength(15)]],
      stockNumber: [eq?.stockNumber ?? null, [Validators.required, Validators.min(1)]],
      imageUrl: [eq?.imageUrl ?? '', Validators.required],
      frontViewUrl: [eq?.frontViewUrl ?? ''],
      sideViewUrl: [eq?.sideViewUrl ?? ''],
      rearViewUrl: [eq?.rearViewUrl ?? ''],
    });

    if (!this.isEdit) {
      this.centerService.getActiveCenters().pipe(take(1)).subscribe(res => this.centers = res?.data ?? []);
      this.trainerService.getActiveTrainers().pipe(take(1)).subscribe((res: any) => this.trainers = res?.data ?? []);
    }
  }

  /** Validates, uploads to Strapi, and patches the matching form control's value (a relative Strapi path). */
  onFileSelected(event: Event, field: EquipmentImageField): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = ''; // allow re-selecting the same file after a failed/replaced upload

    if (!file) return;

    const validationError = imageValidator()({ value: file } as any);
    if (validationError) {
      this.uploadError[field] = validationError['invalidType']
        ? 'Please upload a JPEG, PNG or WebP image'
        : 'Image must be under 5MB';
      return;
    }

    this.uploadError[field] = null;
    this.uploading[field] = true;

    this.strapiService.uploadToStrapi(file).pipe(take(1)).subscribe({
      next: (res) => {
        this.uploading[field] = false;
        const uploaded = res?.[0];
        if (!uploaded?.url) {
          this.uploadError[field] = 'Upload failed — no file returned';
          return;
        }
        this.form.get(field)?.setValue(uploaded.url);
        this.form.get(field)?.markAsDirty();
      },
      error: (err: any) => {
        this.uploading[field] = false;
        this.uploadError[field] = err?.error?.message || 'Upload failed — try again';
      }
    });
  }

  removeImage(field: EquipmentImageField): void {
    this.form.get(field)?.setValue('');
    this.form.get(field)?.markAsDirty();
    this.uploadError[field] = null;
  }

  setOwnerType(type: 'center' | 'trainer'): void {
    if (this.isEdit) return;
    this.form.patchValue({ ownerType: type, centerId: null, trainerId: null });
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }

  save(): void {
    if (this.saving) return;

    const ownerType = this.form.value.ownerType;
    if (!this.isEdit && ownerType === 'center' && !this.form.value.centerId) {
      this.invalidForm = true;
      this.snackBar.openSnackBar('Choose a center to assign this equipment to.', 'error');
      return;
    }
    if (!this.isEdit && ownerType === 'trainer' && !this.form.value.trainerId) {
      this.invalidForm = true;
      this.snackBar.openSnackBar('Choose a trainer to assign this equipment to.', 'error');
      return;
    }
    if (this.form.invalid) {
      this.invalidForm = true;
      this.form.markAllAsTouched();
      this.snackBar.openSnackBar('Invalid form. Please complete all required fields.', 'error');
      return;
    }

    const value = this.form.value;
    const payload: any = {
      id: this.data?.equipment?.id ?? null,
      name: value.name,
      description: value.description,
      stockNumber: value.stockNumber,
      imageUrl: value.imageUrl,
      frontViewUrl: value.frontViewUrl,
      sideViewUrl: value.sideViewUrl,
      rearViewUrl: value.rearViewUrl,
      categoryIds: '',
    };
    if (!this.isEdit) {
      payload.centerId = ownerType === 'center' ? value.centerId : null;
      payload.trainerId = ownerType === 'trainer' ? value.trainerId : null;
    }

    this.invalidForm = false;
    this.saving = true;

    const request$ = this.isEdit
      ? this.centerService.updateEquipment(payload)
      : this.centerService.addEquipment(payload);

    request$.pipe(take(1)).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.snackBar.openSnackBar(res?.message || 'Saved successfully', '');
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.saving = false;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      }
    });
  }
}
