import { Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Newsletter, NewsletterMessage } from 'src/app/models/newsletter.model';
import { NewsletterStateService } from 'src/app/services/newsletter-state.service';
import { NewsletterService } from 'src/app/services/newsletter.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-newsletter-message-modal',
  templateUrl: './newsletter-message-modal.component.html',
  styleUrls: ['./newsletter-message-modal.component.css']
})
export class NewsletterMessageModalComponent {
  onSendMessage = new EventEmitter();
  newsletterMessageForm!: FormGroup;
  newsletterData!: Newsletter;
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
    if (this.newsletterMessageForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
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
    this.newsletterMessageForm.reset();
  }

}

