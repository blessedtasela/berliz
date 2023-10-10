import { Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ContactUsService } from 'src/app/services/contact-us.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-add-contact-us-modal',
  templateUrl: './add-contact-us-modal.component.html',
  styleUrls: ['./add-contact-us-modal.component.css']
})
export class AddContactUsModalComponent {
  onAddContactUsEmit = new EventEmitter();
  contactUsForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: string = '';

  constructor(private formBuilder: FormBuilder,
    private contactUsService: ContactUsService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private dialogRef: MatDialogRef<AddContactUsModalComponent>) { }


  ngOnInit(): void {
    this.contactUsForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.minLength(6)]],
      'email': ['', [Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])]],
      'message': ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  submitForm() {
    this.ngxService.start()
    console.log("form value: ", this.contactUsForm.value)
    this.ngxService.start();
    if (this.contactUsForm.invalid) {
      this.invalidForm = true
      this.snackBarService.openSnackBar("Invalid form input", 'error');
      this.ngxService.stop()
    }
    else {
      this.contactUsService.addContactUs(this.contactUsForm.value)
        .subscribe((response: any) => {
          this.contactUsForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.onAddContactUsEmit.emit()
          this.ngxService.stop()
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
    this.snackBarService.openSnackBar(this.responseMessage, "error");
  }

  closeDialog() {
    this.dialogRef.close("Dialog closed successfully");
  }
}

