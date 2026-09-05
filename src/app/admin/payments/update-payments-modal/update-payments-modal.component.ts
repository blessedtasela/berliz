import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Payments } from 'src/app/models/payment.interface';
import { PaymentService } from 'src/app/services/payment.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Edits a pending (not-yet-active) payment record. The backend rejects any
 * update once a payment's status flips to active, so the form is disabled
 * up front for those rather than letting the admin submit into a
 * guaranteed error.
 */
@Component({
  selector: 'app-update-payments-modal',
  templateUrl: './update-payments-modal.component.html',
  styleUrls: ['./update-payments-modal.component.css']
})
export class UpdatePaymentsModalComponent implements OnInit {
  onUpdatePaymentEmit = new EventEmitter();
  updatePaymentForm!: FormGroup;
  invalidForm = false;
  submitting = false;
  responseMessage: any;

  paymentData: Payments;

  get isActive(): boolean {
    return this.paymentData?.status === 'true';
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private paymentService: PaymentService,
    public dialogRef: MatDialogRef<UpdatePaymentsModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
  ) {
    this.paymentData = this.data.paymentData;
  }

  ngOnInit(): void {
    this.updatePaymentForm = this.formBuilder.group({
      paymentMethod: [this.paymentData.paymentMethod, Validators.required],
      amount: [this.paymentData.amount, [Validators.required, Validators.min(0.01)]],
    });

    if (this.isActive) this.updatePaymentForm.disable();
  }

  updatePayment(): void {
    if (this.isActive || this.updatePaymentForm.invalid || this.submitting) {
      this.invalidForm = true;
      return;
    }

    this.submitting = true;
    this.ngxService.start();
    this.paymentService.updatePayment({
      id: this.paymentData.id,
      paymentMethod: this.updatePaymentForm.value.paymentMethod,
      amount: Number(this.updatePaymentForm.value.amount),
    }).subscribe({
      next: (response: any) => {
        this.ngxService.stop();
        this.submitting = false;
        this.onUpdatePaymentEmit.emit();
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, '');
        this.dialogRef.close('Payment updated successfully');
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
    this.dialogRef.close('Dialog closed without updating the payment');
  }
}
