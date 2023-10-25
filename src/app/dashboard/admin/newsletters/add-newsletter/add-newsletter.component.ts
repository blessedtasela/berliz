import { Component, EventEmitter, HostListener, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NewsletterService } from 'src/app/services/newsletter.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';
import { UpdateNewsletterModalComponent } from '../update-newsletter-modal/update-newsletter-modal.component';

@Component({
  selector: 'app-add-newsletter',
  templateUrl: './add-newsletter.component.html',
  styleUrls: ['./add-newsletter.component.css']
})
export class AddNewsletterComponent {
  onAddNewsletter = new EventEmitter()
  newsletterForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;

  constructor(private formBuilder: FormBuilder,
    private newsletterService: NewsletterService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddNewsletterComponent>,) { }

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

