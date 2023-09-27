import { Component, EventEmitter, Inject } from '@angular/core';
import { inject } from '@angular/core/testing';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ContactUs } from 'src/app/models/contact-us.model';
import { ContactUsService } from 'src/app/services/contact-us.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-update-contact-us-modal',
  templateUrl: './update-contact-us-modal.component.html',
  styleUrls: ['./update-contact-us-modal.component.css']
})
export class UpdateContactUsModalComponent {
  onUpdateContactUsEmit = new EventEmitter();
  contactUsForm!: FormGroup;
  contactUsData!: ContactUs;
  invalidForm: boolean = false;
  responseMessage: string = '';

  constructor(private formBuilder: FormBuilder,
    private contactUsService: ContactUsService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UpdateContactUsModalComponent>) {
    this.contactUsData = data.contactUsData;
  }


  ngOnInit(): void {
    this.contactUsForm = this.formBuilder.group({
      'id': new FormControl(this.contactUsData.id, Validators.required),
      'email': new FormControl(this.contactUsData.email, [Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])]),
      'name': new FormControl(this.contactUsData.name, [Validators.required, Validators.minLength(6)]),
      'message': new FormControl(this.contactUsData.message, [Validators.required, Validators.minLength(20)])
    });
  }

  updateContactUs() {
    this.ngxService.start();
    if (this.contactUsForm.invalid) {
      this.invalidForm = true
      this.ngxService.stop()
      this.snackBarService.openSnackBar("Invalid form input", "error");
    }
    else {
      this.contactUsService.updateContactUs(this.contactUsForm.value)
        .subscribe((response: any) => {
          this.contactUsForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.onUpdateContactUsEmit.emit()
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
    this.ngxService.stop();
    this.snackBarService.openSnackBar(this.responseMessage, "error");
  }
}