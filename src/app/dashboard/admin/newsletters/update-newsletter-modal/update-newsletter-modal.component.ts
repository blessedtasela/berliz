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
  styleUrls: ['./update-newsletter-modal.component.css']
})
export class UpdateNewsletterModalComponent {
  onUpdateNewsletter = new EventEmitter();
  newsletterForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
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
    if (this.newsletterForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
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

  closeDialog() {
    this.dialogRef.close("Dialog closed without updating newsletter")
  }
}
