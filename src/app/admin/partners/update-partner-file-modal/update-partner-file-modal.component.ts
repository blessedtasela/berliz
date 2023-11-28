import { ChangeDetectorRef, Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Partners } from 'src/app/models/partners.interface';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { AddPartnerModalComponent } from '../add-partner-modal/add-partner-modal.component';

@Component({
  selector: 'app-update-partner-file-modal',
  templateUrl: './update-partner-file-modal.component.html',
  styleUrls: ['./update-partner-file-modal.component.css']
})
export class UpdatePartnerFileModalComponent {
  onUpdateFile = new EventEmitter();
  onUpdatePartnerFileEmit = new EventEmitter()
  updatePartnerForm!: FormGroup;
  invalidForm: boolean = false;
  formIndex: number = 0;
  partnerData: Partners;
  responseMessage: any;
  selectedCV: any;
  selectedCertificate: any;

  constructor(private formBuilder: FormBuilder,
    private partnerService: PartnerService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AddPartnerModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.partnerData = data.partnerData;
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.updatePartnerForm = this.formBuilder.group({
      'id': new FormControl(this.partnerData?.id, [Validators.required]),
      'certificate': new FormControl(this.selectedCertificate, [Validators.required, Validators.minLength(2)]),
      'cv': new FormControl(this.selectedCV, Validators.compose([Validators.required, Validators.minLength(5)])),
    });
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without updating partner file')
  }

  checkFiles() {
    if (this.partnerData && this.partnerData.certificate && this.partnerData.cv) {
      const cvBlob = new Blob([this.partnerData.cv], { type: 'application/pdf' });
      const certificateBlob = new Blob([this.partnerData.certificate], { type: 'application/pdf' });

      // Create a File from the Blob 
      this.selectedCertificate = new File([certificateBlob], 'certificate.pdf');
      this.selectedCV = new File([cvBlob], 'cv.pdf');

      // Update the value of the input field using the FormControl
      this.updatePartnerForm.get('certificate')?.setValue(this.selectedCertificate);
      this.updatePartnerForm.get('cv')?.setValue(this.selectedCV);
    }
  }

  onCVSelected(event: any): void {
    this.selectedCV = event.target.files[0];
  }

  onCertificateSelected(event: any): void {
    this.selectedCertificate = event.target.files[0];
  }


  updatePartner(): void {
    this.ngxService.start();
    const requestData = new FormData();
    requestData.append('id', this.updatePartnerForm.get('id')?.value);
    requestData.append('certificate', this.selectedCertificate);
    requestData.append('cv', this.selectedCV);

    if (this.updatePartnerForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      this.partnerService.updateFile(requestData)
        .subscribe((response: any) => {
          this.updatePartnerForm.reset();
          this.partnerService.setPartnerFormIndex(0);
          this.invalidForm = false;
          this.dialogRef.close('Partner file updated successfully');
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.onUpdatePartnerFileEmit.emit();
        }
          , (error: any) => {
            this.ngxService.stop();
            console.error("error");
            if (error.error?.message) {
              this.responseMessage = error.error?.message;
            } else {
              this.responseMessage = genericError;
            }
            this.snackBarService.openSnackBar(this.responseMessage, "error");
          });
    }
    this.ngxService.stop();
    this.snackBarService.openSnackBar(this.responseMessage, "error");
  }

  clear() {
    this.updatePartnerForm.reset();
  }
}
