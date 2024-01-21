import { Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NewsletterService } from 'src/app/services/newsletter.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StateService } from 'src/app/services/state.service';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-add-newsletter-modal',
  templateUrl: './add-newsletter-modal.component.html',
  styleUrls: ['./add-newsletter-modal.component.css']
})
export class AddNewsletterModalComponent {
  onAddNewsletter = new EventEmitter()
  newsletterForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;

  constructor(private formBuilder: FormBuilder,
    private newsletterService: NewsletterService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddNewsletterModalComponent>,
    private stateService: StateService) { }

  ngOnInit() {
    this.newsletterForm = this.formBuilder.group({
      'email': ['', [Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])]]
    });
  }

  addNewsletter(): void {
    this.ngxService.start();
    if (this.newsletterForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      this.newsletterService.addNewsletter(this.newsletterForm.value)
        .subscribe((response: any) => {
          this.newsletterForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.onAddNewsletter.emit();
          this.stateService.setShowNewsletter("true");
          this.dialogRef.close("News letter added successfully");
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
    this.dialogRef.close("Dialog closed without adding newsletter")
  }

  clear() {
    this.newsletterForm.reset()
  }
}

