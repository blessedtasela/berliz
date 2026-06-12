import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Partner } from 'src/app/models/partners.interface';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { fileValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-update-partner-file-modal',
  templateUrl: './update-partner-file-modal.component.html',
  styleUrls: ['./update-partner-file-modal.component.css']
})
export class UpdatePartnerFileModalComponent implements OnInit {

  onUpdatePartnerFileEmit = new EventEmitter<void>();

  updatePartnerForm!: FormGroup;
  invalidForm        = false;
  partnerData:        Partner;

  // Actual File objects — tracked outside the FormControl for UI preview
  selectedCertification: File | null = null;
  selectedResume:        File | null = null;

  /**
   * Both files must be present before the submit button is enabled.
   * This is the single source of truth for the button's disabled state.
   */
  get canSubmit(): boolean {
    return !!this.selectedCertification && !!this.selectedResume;
  }

  constructor(
    private fb:           FormBuilder,
    private partnerService: PartnerService,
    private cdr:          ChangeDetectorRef,
    public  dialogRef:    MatDialogRef<UpdatePartnerFileModalComponent>,
    private ngxService:   NgxUiLoaderService,
    private snackBar:     SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.partnerData = data.partnerData;
  }

  ngOnInit(): void {
    this.updatePartnerForm = this.fb.group({
      id:            [this.partnerData?.id, Validators.required],
      // File controls — required + file size validator
      certification: [null, [Validators.required, fileValidator]],
      resume:        [null, [Validators.required, fileValidator]],
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  // ── File selection ────────────────────────────────────────────────────────

  onCertificationSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedCertification = file;
    this.updatePartnerForm.get('certification')?.setValue(file);
    this.updatePartnerForm.get('certification')?.markAsTouched();
  }

  onResumeSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedResume = file;
    this.updatePartnerForm.get('resume')?.setValue(file);
    this.updatePartnerForm.get('resume')?.markAsTouched();
  }

  clearCertification(event: Event): void {
    event.stopPropagation();
    this.selectedCertification = null;
    this.updatePartnerForm.get('certification')?.setValue(null);
    this.updatePartnerForm.get('certification')?.markAsTouched();
  }

  clearResume(event: Event): void {
    event.stopPropagation();
    this.selectedResume = null;
    this.updatePartnerForm.get('resume')?.setValue(null);
    this.updatePartnerForm.get('resume')?.markAsTouched();
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  updatePartner(): void {
    this.invalidForm = true;

    // Guard — belt-and-suspenders even though the button is disabled when missing
    if (!this.selectedCertification || !this.selectedResume) {
      this.snackBar.openSnackBar('Both certification and resume are required.', 'error');
      return;
    }

    if (this.updatePartnerForm.invalid) {
      this.snackBar.openSnackBar('Please fix the form before submitting.', 'error');
      return;
    }

    const fd = new FormData();
    fd.append('id',            this.updatePartnerForm.get('id')?.value);
    fd.append('certification', this.selectedCertification); // field names match updated backend
    fd.append('resume',        this.selectedResume);

    this.ngxService.start();
    this.partnerService.updateFile(fd).subscribe({
      next: (res: any) => {
        this.ngxService.stop();
        this.snackBar.openSnackBar(res?.message ?? 'Documents updated successfully', '');
        this.dialogRef.close('Documents updated');
        this.onUpdatePartnerFileEmit.emit();
      },
      error: (err: any) => {
        this.ngxService.stop();
        this.snackBar.openSnackBar(err?.error?.message ?? genericError, 'error');
      }
    });
  }

  // ── Dialog close ──────────────────────────────────────────────────────────

  closeDialog(): void {
    this.dialogRef.close('Closed without saving');
  }
}