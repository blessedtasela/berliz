import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Actions, ofType } from '@ngrx/effects';
import { Subscription } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { addFaq, addFaqFailure, addFaqSuccess } from 'src/app/state/faq/faq.actions';

@Component({
  selector: 'app-add-faq-modal',
  templateUrl: './add-faq-modal.component.html',
  styleUrls: ['./add-faq-modal.component.css']
})
export class AddFaqModalComponent implements OnDestroy {
  onAddFaqEmit = new EventEmitter();
  addFaqForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private actions$: Actions,
    public dialogRef: MatDialogRef<AddFaqModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService) {

    this.addFaqForm = this.formBuilder.group({
      'category': ['', [Validators.required]],
      'question': ['', [Validators.required, Validators.minLength(5)]],
      'answer': ['', [Validators.required, Validators.minLength(10)]],
      'displayOrder': [0],
    });

    this.subscriptions.push(
      this.actions$.pipe(ofType(addFaqSuccess)).subscribe(({ response }) => {
        this.ngxService.stop();
        this.onAddFaqEmit.emit();
        this.addFaqForm.reset();
        this.invalidForm = false;
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, '');
        this.dialogRef.close('FAQ added successfully');
      }),
      this.actions$.pipe(ofType(addFaqFailure)).subscribe(({ error }) => {
        this.ngxService.stop();
        this.responseMessage = error || genericError;
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  addFaq(): void {
    if (this.addFaqForm.invalid) {
      this.invalidForm = true;
      this.snackbarService.openSnackBar('Invalid form', 'error');
      return;
    }
    this.ngxService.start();
    this.store.dispatch(addFaq({ data: this.addFaqForm.value }));
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without adding an FAQ');
  }

  clear() {
    this.addFaqForm.reset({ displayOrder: 0 });
  }
}
