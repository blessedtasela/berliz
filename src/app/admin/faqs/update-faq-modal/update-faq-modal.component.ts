import { Component, EventEmitter, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Faq } from 'src/app/models/faq.model';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { updateFaq, updateFaqFailure, updateFaqSuccess } from 'src/app/state/faq/faq.actions';

@Component({
  selector: 'app-update-faq-modal',
  templateUrl: './update-faq-modal.component.html',
  styleUrls: ['./update-faq-modal.component.css']
})
export class UpdateFaqModalComponent implements OnInit, OnDestroy {
  onUpdateFaqEmit = new EventEmitter();
  updateFaqForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  faqData!: Faq;
  subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UpdateFaqModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private store: Store,
    private actions$: Actions,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.faqData = this.data.faqData;
  }

  ngOnInit(): void {
    this.updateFaqForm = this.formBuilder.group({
      'id': new FormControl(this.faqData.id, [Validators.required]),
      'category': new FormControl(this.faqData.category, [Validators.required]),
      'question': new FormControl(this.faqData.question, [Validators.required, Validators.minLength(5)]),
      'answer': new FormControl(this.faqData.answer, [Validators.required, Validators.minLength(10)]),
      'displayOrder': new FormControl(this.faqData.displayOrder ?? 0),
    });

    this.subscriptions.push(
      this.actions$.pipe(ofType(updateFaqSuccess)).subscribe(({ response }) => {
        this.ngxService.stop();
        this.onUpdateFaqEmit.emit();
        this.invalidForm = false;
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, '');
        this.dialogRef.close('FAQ updated successfully');
      }),
      this.actions$.pipe(ofType(updateFaqFailure)).subscribe(({ error }) => {
        this.ngxService.stop();
        this.responseMessage = error || genericError;
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  updateFaq(): void {
    if (this.updateFaqForm.invalid) {
      this.invalidForm = true;
      this.snackbarService.openSnackBar('Invalid form', 'error');
      return;
    }
    this.ngxService.start();
    this.store.dispatch(updateFaq({ data: this.updateFaqForm.value }));
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without updating the FAQ');
  }

  clear() {
    this.updateFaqForm.reset({
      id: this.faqData.id,
      category: this.faqData.category,
      question: this.faqData.question,
      answer: this.faqData.answer,
      displayOrder: this.faqData.displayOrder ?? 0,
    });
  }
}
