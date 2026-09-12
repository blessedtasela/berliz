import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Users } from 'src/app/models/users.interface';
import { PaymentService } from 'src/app/services/payment.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectUsers } from 'src/app/state/user/user.selector';
import { loadActiveUsers } from 'src/app/state/user/user.actions';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Admin-recorded payment for a user with an active subscription. Rebuilt
 * against the real backend contract (PaymentRequest: email + paymentMethod
 * + amount) — the previous version of this form posted the same
 * copy-pasted {name, photo, description, likes, tagIds} shape used
 * (wrongly) across several other admin "add" modals. Payment processing
 * itself isn't integrated yet (see the payment/subscription model design
 * notes) — paymentMethod is a free-text record of how it was collected
 * (e.g. "Manual"), not a live charge.
 */
@Component({
  selector: 'app-add-payments-modal',
  templateUrl: './add-payments-modal.component.html',
  styleUrls: ['./add-payments-modal.component.css']
})
export class AddPaymentsModalComponent implements OnInit {
  onAddPaymentEmit = new EventEmitter();
  addPaymentForm!: FormGroup;
  invalidForm = false;
  submitting = false;
  responseMessage: any;

  users: Users[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private paymentService: PaymentService,
    private store: Store,
    public dialogRef: MatDialogRef<AddPaymentsModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.addPaymentForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      paymentMethod: ['Manual', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
    });

    this.store.dispatch(loadActiveUsers());
    this.store.select(selectUsers).subscribe(users => this.users = users);
  }

  addPayment(): void {
    if (this.addPaymentForm.invalid || this.submitting) {
      this.invalidForm = true;
      return;
    }

    this.submitting = true;
    this.ngxService.start();
    this.paymentService.addPayment({
      ...this.addPaymentForm.value,
      amount: Number(this.addPaymentForm.value.amount),
    }).subscribe({
      next: (response: any) => {
        this.ngxService.stop();
        this.submitting = false;
        this.onAddPaymentEmit.emit();
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, '');
        this.dialogRef.close('Payment added successfully');
      },
      error: (error: any) => {
        this.ngxService.stop();
        this.submitting = false;
        this.responseMessage = error.error?.message || genericError;
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close('Dialog closed without adding a payment');
  }

  clear(): void {
    this.addPaymentForm.reset({ paymentMethod: 'Manual' });
    this.invalidForm = false;
  }
}
