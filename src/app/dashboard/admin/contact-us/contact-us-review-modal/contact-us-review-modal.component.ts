import { Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ContactUsService } from 'src/app/services/contact-us.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';
import { AddContactUsModalComponent } from '../add-contact-us-modal/add-contact-us-modal.component';
import { ContactUsStateService } from 'src/app/services/contact-us-state.service';
import { ContactUs, ContactUsMessage } from 'src/app/models/contact-us.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contact-us-review-modal',
  templateUrl: './contact-us-review-modal.component.html',
  styleUrls: ['./contact-us-review-modal.component.css']
})
export class ContactUsReviewModalComponent {
  onReviewContactUsEmit = new EventEmitter();
  reviewContactUsForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: string = '';
  contactUs!: ContactUs;
  selectedMessage: string = '';
  selectedSubject: string = '';
  savedMessages: ContactUsMessage[] = [];
  subscription = new Subscription;

  constructor(private formBuilder: FormBuilder,
    private contactUsService: ContactUsService,
    private contactUsStateService: ContactUsStateService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddContactUsModalComponent>) {
    this.contactUs = this.data.contactUs;
  }

  ngOnInit(): void {
    this.reviewContactUsForm = this.formBuilder.group({
      'savedSubject': '',
      'savedBody': '',
      'id': this.contactUs?.id,
      'subject': ['', [Validators.required, Validators.minLength(12)]],
      'body': ['', [Validators.required, Validators.minLength(50)]],
    });

    this.contactUsStateService.contactUsMessageData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent();
      } else {
        this.savedMessages = cachedData
      }
    })
  }

  handleEmitEvent() {
    this.subscription.add(this.contactUsStateService.getContactUsMessages().subscribe((messages) => {
      this.ngxService.start()
      console.log("isCached false")
      this.savedMessages = messages
      this.contactUsStateService.setContactUsMessageSubject(this.savedMessages);
      this.ngxService.stop()
    }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.selectedMessage = '';
      this.selectedSubject = '';
    });
  }

  reviewContactUs() {
    this.ngxService.start()
    this.ngxService.start();
    if (this.reviewContactUsForm.invalid) {
      this.invalidForm = true
      this.snackBarService.openSnackBar("Invalid form input", 'error');
      this.ngxService.stop()
    }
    else {
      this.contactUsService.reviewContactUs(this.reviewContactUsForm.value)
        .subscribe((response: any) => {
          this.reviewContactUsForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.onReviewContactUsEmit.emit()
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

  clear() {
    this.reviewContactUsForm.reset();
  }

}

