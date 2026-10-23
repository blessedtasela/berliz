import { Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NewsletterService } from 'src/app/services/newsletter.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';

@Component({
    selector: 'app-update-newsletter-modal',
    templateUrl: './update-newsletter-modal.component.html',
    styleUrls: ['./update-newsletter-modal.component.css'],
    standalone: false
})
export class UpdateNewsletterModalComponent {
  onUpdateNewsletter = new EventEmitter();
  newsletterForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  submitError: string | null = null;
  newsletterData: any;


  constructor(private formBuilder: FormBuilder,
    private newsletterService: NewsletterService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UpdateNewsletterModalComponent>,) {
    this.newsletterData = this.data.newsletterData;
  }

  ngOnInit() {
    this.newsletterForm = this.formBuilder.group({
      'id': new FormControl(this.newsletterData.id, [Validators.required]),
      'email': new FormControl(this.newsletterData.email, [Validators.required,
      Validators.email, emailExtensionValidator(['com', 'org'])])
    });
  }



  updateNewsletter(): void {
    this.ngxService.start();
    this.submitError = null;
    if (this.newsletterForm.invalid) {
      this.invalidForm = true
      this.newsletterForm.markAllAsTouched();
      this.submitError = 'Please fill in the highlighted fields';
      this.ngxService.stop();
    } else {
      this.newsletterService.updateNewsletter(this.newsletterForm.value)
        .subscribe((response: any) => {
          this.newsletterForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.onUpdateNewsletter.emit();
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          this.submitError = error?.error?.message || genericError;
        });
    }
    this.ngxService.stop();
  }

  closeDialog() {
    this.dialogRef.close("Dialog closed without updating newsletter")
  }

  clear() {
    this.newsletterForm.reset()
  }
}
