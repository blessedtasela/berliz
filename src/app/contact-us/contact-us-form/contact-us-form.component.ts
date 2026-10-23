import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ContactUsService } from 'src/app/services/contact-us.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { emailExtensionValidator, fullNameValidator, genericError } from 'src/validators/form-validators.module';

@Component({
    selector: 'app-contact-us-form',
    templateUrl: './contact-us-form.component.html',
    styleUrls: ['./contact-us-form.component.css'],
    standalone: false
})
export class ContactUsFormComponent implements OnInit {
  onAddContactUsEmit = new EventEmitter();
  contactUsForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: string = '';
  submitError: string | null = null;

  constructor(private formBuilder: FormBuilder,
    private contactUsService: ContactUsService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService) { }


  ngOnInit(): void {
    this.contactUsForm = this.formBuilder.group({
      'name': ['', [Validators.required, fullNameValidator()]],
      'email': ['', [Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])]],
      // Backend's ContactUs.message is an unbounded TEXT column with no @Size
      // validation -- this is a client-side guard against unbounded payloads,
      // not a substitute for one.
      'message': ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]]
    });
  }

  submitForm() {
    this.responseMessage = '';
    this.submitError = null;
    if (this.contactUsForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Please fill out the form correctly.";
      this.contactUsForm.markAllAsTouched();
      this.submitError = 'Enter your full name, a valid email, and a message of at least 20 characters.';
    }
    else {
      this.ngxService.start()
      this.contactUsService.addContactUs(this.contactUsForm.value)
        .subscribe((response: any) => {
          this.contactUsForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message || 'Your message has been sent. We will get back to you soon.';
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
          this.submitError = this.responseMessage;
        });
    }
  }

  clear() {
    this.contactUsForm.reset()
    this.invalidForm = false;
  }
}
