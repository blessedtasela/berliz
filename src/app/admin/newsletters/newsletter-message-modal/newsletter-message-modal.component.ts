import { Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Newsletter, NewsletterMessage } from 'src/app/models/newsletter.model';
import { NewsletterService } from 'src/app/services/newsletter.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';
import { Store } from '@ngrx/store';
import { loadNewsletterMessages } from 'src/app/state/newsletter/newsletter.actions';
import { selectNewsletterMessages } from 'src/app/state/newsletter/newsletter.selectors';

@Component({
    selector: 'app-newsletter-message-modal',
    templateUrl: './newsletter-message-modal.component.html',
    styleUrls: ['./newsletter-message-modal.component.css'],
    standalone: false
})
export class NewsletterMessageModalComponent {
  onSendMessage = new EventEmitter();
  newsletterMessageForm!: FormGroup;
  newsletterData!: Newsletter;
  invalidForm: boolean = false;
  responseMessage: string = '';
  submitError: string | null = null;
  selectedMessage: string = ''
  selectedSubject: string = ''
  savedMessages: NewsletterMessage[] = [];
  subscription = new Subscription;

  constructor(private formBuilder: FormBuilder,
    private newsletterService: NewsletterService,
    private store: Store,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<NewsletterMessageModalComponent>) {
    this.newsletterData = data.newsletterData;
  }


  ngOnInit(): void {
    this.newsletterMessageForm = this.formBuilder.group({
      'savedSubject': '',
      'savedBody': '',
      'subject': ['', [Validators.required, Validators.minLength(12)]],
      'body': ['', [Validators.required, Validators.minLength(50)]],
      'email': new FormControl(this.newsletterData.email, [Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])]),
    });

    this.handleEmitEvent();
  }

  handleEmitEvent() {
    this.store.dispatch(loadNewsletterMessages());
    this.subscription.add(this.store.select(selectNewsletterMessages).subscribe((messages) => {
      this.savedMessages = messages
    }));
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

  closeDialog() {
    this.dialogRef.close("Dialog closed successfully");
  }

  sendNewsletterMessage() {
    this.ngxService.start();
    this.submitError = null;
    if (this.newsletterMessageForm.invalid) {
      this.invalidForm = true
      this.newsletterMessageForm.markAllAsTouched();
      this.submitError = 'Please fill in the highlighted fields';
      this.ngxService.stop()
    }
    else {
      this.newsletterService.sendMessage(this.newsletterMessageForm.value)
        .subscribe((response: any) => {
          this.newsletterMessageForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.onSendMessage.emit()
          this.handleEmitEvent()
          this.ngxService.stop()
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          this.submitError = error?.error?.message || genericError;
        });
    }
    this.ngxService.stop();
  }

  clear() {
    this.newsletterMessageForm.reset();
  }

}

