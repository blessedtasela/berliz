import { Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { NewsletterMessage } from 'src/app/models/newsletter.model';
import { NewsletterStateService } from 'src/app/services/newsletter-state.service';
import { NewsletterService } from 'src/app/services/newsletter.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-newsletter-bulk-message-modal',
  templateUrl: './newsletter-bulk-message-modal.component.html',
  styleUrls: ['./newsletter-bulk-message-modal.component.css']
})
export class NewsletterBulkMessageModalComponent {
  onSendMessage = new EventEmitter();
  newsletterBulkMessageForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: string = '';
  selectedMessage: string = ''
  selectedSubject: string = ''
  savedMessages: NewsletterMessage[] = [];
  subscription = new Subscription;

  constructor(private formBuilder: FormBuilder,
    private newsletterService: NewsletterService,
    private newsletterStateService: NewsletterStateService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private dialogRef: MatDialogRef<NewsletterBulkMessageModalComponent>) {
  }

  ngOnInit(): void {
    this.newsletterBulkMessageForm = this.formBuilder.group({
      'savedSubject': '',
      'savedBody': '',
      'subject': ['', [Validators.required, Validators.minLength(12)]],
      'body': ['', [Validators.required, Validators.minLength(50)]],
    });

    this.newsletterStateService.newsletterMessageData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent();
      } else {
        this.savedMessages = cachedData
      }
    })
  }

  handleEmitEvent() {
    this.subscription.add(this.newsletterStateService.getNewsletterMessages().subscribe((messages) => {
      this.ngxService.start()
      console.log("isCached false")
      this.savedMessages = messages
      this.newsletterStateService.setNewsletterMessageSubject(this.savedMessages);
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

  closeDialog() {
    this.dialogRef.close("Dialog closed successfully");
  }

  sendNewsletterMessage() {
    this.ngxService.start();
    if (this.newsletterBulkMessageForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop()
    }
    else {
      this.newsletterService.sendBulkMessage(this.newsletterBulkMessageForm.value)
        .subscribe((response: any) => {
          this.newsletterBulkMessageForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.onSendMessage.emit()
          this.handleEmitEvent()
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

  clear() {
    this.newsletterBulkMessageForm.reset();
  }

}

