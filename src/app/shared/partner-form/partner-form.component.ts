import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiService } from 'src/app/services/strapi.service';

import { fileValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-partner-form',
  templateUrl: './partner-form.component.html',
  styleUrls: ['./partner-form.component.css']
})
export class PartnerFormComponent implements OnInit {

  addPartnerForm!: FormGroup;
  invalidForm = false;
  uploading = false;
  uploadProgress = 0;

  selectedCertification: File | null = null;
  selectedResume: File | null = null;

  private certificationUrl = '';
  private resumeUrl = '';
  showRoleSelector = !this.data?.role;
  private readonly STORAGE_KEY = 'berliz_partner_form';
  private isRestoring = false;

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PartnerFormComponent>,
    private fb: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private snackBar: SnackBarService,
    private partnerService: PartnerService,
    private strapiService: StrapiService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.restoreFormFromStorage();
  }

  private restoreFormFromStorage(): void {
    const saved = sessionStorage.getItem(this.STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      this.isRestoring = true;
      this.addPartnerForm.patchValue(parsed);
      this.isRestoring = false;
    } catch (e) {
      sessionStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private buildForm(): void {
    this.addPartnerForm = this.fb.group({
      motivation: ['', [Validators.required, Validators.minLength(900), Validators.maxLength(1200)]],
      facebookUrl: ['', [Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?facebook\\.com\\/.+$')]],
      instagramUrl: ['', [Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?instagram\\.com\\/.+$')]],
      youtubeUrl: ['', Validators.pattern('^(https?:\\/\\/)?(www\\.)?youtube\\.com\\/.+$')],
      role: [this.data?.role ?? '', Validators.required],
      agreePolicy: [false, Validators.requiredTrue],
      email: [this.data?.email ?? null]
    });

    this.addPartnerForm.valueChanges.subscribe(value => {
      if (this.isRestoring) return;
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(value));
    });
  }

  // ── Computed ───────────────────────────────────────────────────────────────

  get canSubmit(): boolean {
    return !!this.selectedCertification
      && !!this.selectedResume
      && this.addPartnerForm.valid
      && !this.uploading;
  }

  private saveFilesToStorage(): void {
    const fileState = {
      certification: this.selectedCertification ? this.selectedCertification.name : null,
      resume: this.selectedResume ? this.selectedResume.name : null
    };

    sessionStorage.setItem(this.STORAGE_KEY + '_files', JSON.stringify(fileState));
  }
  // ── Template helper methods ────────────────────────────────────────────────

  /** True when a field is invalid AND the user has interacted with it or submitted */
  isInvalid(field: string): boolean {
    const ctrl = this.addPartnerForm.get(field);
    return !!ctrl?.invalid && (!!ctrl?.touched || this.invalidForm);
  }

  /** True when a field is valid AND touched */
  isValid(field: string): boolean {
    const ctrl = this.addPartnerForm.get(field);
    return !!ctrl?.valid && !!ctrl?.touched;
  }

  /** Current char length for a textarea field */
  charCount(field: string): number {
    return this.addPartnerForm.get(field)?.value?.length ?? 0;
  }

  /**
   * Returns counter colour class:
   *  - red  → below min
   *  - green → between min and max
   *  - orange → above max
   */
  charCountClass(field: string, min: number, max: number): string {
    const len = this.charCount(field);
    if (len < min) return 'text-red-500';
    if (len <= max) return 'text-green-600';
    return 'text-orange-500';
  }

  /** Border/bg classes for the motivation textarea */
  motivationClasses(): Record<string, boolean> {
    return {
      'border-red-300   focus:ring-red-400': this.isInvalid('motivation'),
      'border-green-400 focus:ring-green-400': this.isValid('motivation'),
      'border-gray-200  focus:ring-red-500': !this.isInvalid('motivation') && !this.isValid('motivation'),
    };
  }

  /** Border colour for social link input wrappers */
  socialFieldClasses(field: string): Record<string, boolean> {
    return {
      'border-red-300': this.isInvalid(field),
      'border-green-400': this.isValid(field),
      'border-gray-200': !this.isInvalid(field) && !this.isValid(field),
    };
  }

  /** Human-readable file size: "1.2 MB", "340 KB" */
  formatFileSize(bytes: number): string {
    if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
    if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(0)} KB`;
    return `${bytes} B`;
  }

  // ── File selection ─────────────────────────────────────────────────────────

  clearCertification(event: Event): void {
    event.stopPropagation();
    this.selectedCertification = null;
    this.patchAndTouch('certification', null);
  }

  clearResume(event: Event): void {
    event.stopPropagation();
    this.selectedResume = null;
    this.patchAndTouch('resume', null);
  }

  private extractFile(event: Event): File | null {
    return (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  private patchAndTouch(field: string, value: any): void {
    const ctrl = this.addPartnerForm.get(field);
    if (!ctrl) return;
    ctrl.markAsTouched();

    // ONLY set value for non-file fields
    if (field !== 'certification' && field !== 'resume') {
      ctrl.setValue(value);
    }
  }

  private setFile(field: 'certification' | 'resume', file: File | null): void {
    if (field === 'certification') this.selectedCertification = file;
    if (field === 'resume') this.selectedResume = file;

    const ctrl = this.addPartnerForm.get(field);
    ctrl?.markAsTouched();
  }

  onCertificationSelected(event: Event): void {
    const file = this.extractFile(event);
    this.setFile('certification', file);
    this.saveFilesToStorage();
  }

  onResumeSelected(event: Event): void {
    const file = this.extractFile(event);
    this.setFile('resume', file);
    this.saveFilesToStorage();
  }
  // ── Upload ─────────────────────────────────────────────────────────────────

  private async uploadDocumentsToStrapi(): Promise<boolean> {
    try {
      this.uploadProgress = 0;

      // Upload certification
      const certRes: any[] =
        await this.strapiService.uploadToStrapi(this.selectedCertification!)
          .pipe(take(1)).toPromise() ?? [];

      this.uploadProgress = 50;

      // Upload resume
      const resumeRes: any[] =
        await this.strapiService.uploadToStrapi(this.selectedResume!)
          .pipe(take(1)).toPromise() ?? [];

      this.uploadProgress = 100;

      if (!certRes[0]?.url || !resumeRes[0]?.url) throw new Error('Missing URL');

      this.certificationUrl = certRes[0].url;
      this.resumeUrl = resumeRes[0].url;

      return true;

    } catch {
      this.snackBar.openSnackBar('Failed to upload documents. Please try again.', 'error');
      return false;
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async submit(): Promise<void> {
    this.invalidForm = true;

    if (!this.selectedCertification || !this.selectedResume) {
      this.snackBar.openSnackBar('Please upload both your certification and resume.', 'error');
      return;
    }

    if (this.addPartnerForm.invalid) {
      this.addPartnerForm.markAllAsTouched();
      this.snackBar.openSnackBar('Please complete all required fields.', 'error');
      return;
    }

    this.uploading = true;
    this.ngxService.start();

    const uploaded = await this.uploadDocumentsToStrapi();
    if (!uploaded) {
      this.uploading = false;
      this.ngxService.stop();
      return;
    }

    const payload = this.buildPayload();

    this.partnerService.addPartner(payload)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.uploading = false;
          this.ngxService.stop();
          this.snackBar.openSnackBar(res?.message ?? 'Application submitted!', '');
          this.dialogRef.close('saved');
          sessionStorage.removeItem(this.STORAGE_KEY);
          sessionStorage.removeItem(this.STORAGE_KEY + '_files');
        },
        error: (err: any) => {
          this.uploading = false;
          this.ngxService.stop();
          this.snackBar.openSnackBar(err?.error?.message ?? genericError, 'error');
        }
      });
  }

  private buildPayload(): Record<string, any> {
    const v = this.addPartnerForm.value;
    return {
      email: this.data?.email,
      certificationUrl: this.certificationUrl,
      resumeUrl: this.resumeUrl,
      motivation: v.motivation,
      facebookUrl: v.facebookUrl,
      instagramUrl: v.instagramUrl,
      youtubeUrl: v.youtubeUrl ?? '',
      role: v.role,
      agreePolicy: v.agreePolicy
    };
  }
  openTerms() {

  }
  // ── Dialog ─────────────────────────────────────────────────────────────────

  closeDialog(): void {
    this.dialogRef.close();
  }
}