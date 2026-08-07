import { Component, EventEmitter, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { SnackBarService } from 'src/app/services/snack-bar.service';
import {
  addNewsletter,
  addNewsletterFailure,
  addNewsletterSuccess
} from 'src/app/state/newsletter/newsletter.actions';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';
import { NewsletterTriggerService } from './newsletter-trigger.service';

@Component({
  selector: 'app-newsletter-popup',
  templateUrl: './newsletter-popup.component.html',
  styleUrls: ['./newsletter-popup.component.css']
})
export class NewsletterPopupComponent implements OnInit, OnDestroy {
  /** Emitted once the subscription is confirmed by the backend. */
  onAddNewsletter = new EventEmitter();

  newsletterForm!: FormGroup;
  invalidForm = false;
  submitting = false;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private actions$: Actions,
    private snackBarService: SnackBarService,
    private trigger: NewsletterTriggerService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NewsletterPopupComponent>,
  ) { }

  ngOnInit(): void {
    this.newsletterForm = this.formBuilder.group({
      'email': ['', [Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])]]
    });

    this.actions$
      .pipe(ofType(addNewsletterSuccess), takeUntil(this.destroy$))
      .subscribe(({ message }) => {
        this.submitting = false;
        this.invalidForm = false;
        this.newsletterForm.reset();
        // Permanent: this browser is on the list, never prompt again.
        this.trigger.markSubscribed();
        this.snackBarService.openSnackBar(message || 'You are subscribed. Welcome aboard!', '');
        this.onAddNewsletter.emit();
        this.dialogRef.close('Newsletter subscription added');
      });

    this.actions$
      .pipe(ofType(addNewsletterFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => {
        this.submitting = false;
        this.snackBarService.openSnackBar(error || genericError, 'error');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addNewsletter(): void {
    if (this.submitting) return;

    if (this.newsletterForm.invalid) {
      this.invalidForm = true;
      this.newsletterForm.markAllAsTouched();
      this.snackBarService.openSnackBar('Invalid form', 'error');
      return;
    }

    this.invalidForm = false;
    this.submitting = true;
    this.store.dispatch(addNewsletter({ data: this.newsletterForm.value }));
  }

  closeDialog(): void {
    this.dialogRef.close('Dialog closed without updating newsletter');
  }

  clear(): void {
    this.newsletterForm.reset();
  }
}
