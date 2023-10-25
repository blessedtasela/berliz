import { Component, EventEmitter, HostListener, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AddNewsletterComponent } from 'src/app/dashboard/admin/newsletters/add-newsletter/add-newsletter.component';
import { UpdateNewsletterModalComponent } from 'src/app/dashboard/admin/newsletters/update-newsletter-modal/update-newsletter-modal.component';
import { NewsletterService } from 'src/app/services/newsletter.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-newsletter-popup',
  templateUrl: './newsletter-popup.component.html',
  styleUrls: ['./newsletter-popup.component.css']
})
export class NewsletterPopupComponent {
  onAddNewsletter = new EventEmitter()
  newsletterForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  showPopUp = false;

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

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showPopUp = window.scrollY > 500;
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

  clear() {
    this.newsletterForm.reset()
  }
}

