import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ContactUsService } from 'src/app/services/contact-us.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { emailExtensionValidator, fullNameValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-contact-us-form',
  templateUrl: './contact-us-form.component.html',
  styleUrls: ['./contact-us-form.component.css']
})
export class ContactUsFormComponent implements OnInit {
  onAddContactUsEmit = new EventEmitter();
  contactUsForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: string = '';

  constructor(private formBuilder: FormBuilder,
    private contactUsService: ContactUsService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService) { }


  ngOnInit(): void {
    this.contactUsForm = this.formBuilder.group({
      'name': ['', [Validators.required, fullNameValidator()]],
      'email': ['', [Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])]],
      'message': ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  submitForm() {
    this.responseMessage = '';
    if (this.contactUsForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Please fill out the form correctly.";
    }
    else {
      this.ngxService.start()
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

  clear() {
    this.contactUsForm.reset()
    this.invalidForm = false;
  }
}
