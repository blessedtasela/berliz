import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { take } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { genericError } from 'src/validators/form-validators.module';

export interface PlanOption {
  value: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-my-trainer-sub-modal',
  templateUrl: './my-trainer-sub-modal.component.html',
  styleUrls: ['./my-trainer-sub-modal.component.css']
})
export class MyTrainerSubModalComponent implements OnInit {

  @Output() closeEvent = new EventEmitter<void>();
  @Output() savedEvent = new EventEmitter<void>();

  subscriptionForm!: FormGroup;

  readonly plans: PlanOption[] = [
    { value: 'MONTH_TO_MONTH', label: 'Month to Month', description: '30-day rolling plan' },
    { value: 'QUARTERLY', label: '3 Months', description: 'Quarterly plan' },
    { value: 'HALF_YEAR', label: '6 Months', description: 'Semi-annual plan' },
    { value: 'ONE_YEAR', label: '1 Year', description: 'Annual plan' },
    { value: 'THREE_YEARS', label: '3 Years', description: 'Extended 3-year plan' },
    { value: 'FIVE_YEARS', label: '5 Years', description: 'Long-term 5-year plan' },
  ];

  constructor(
    private fb: FormBuilder,
    private loader: NgxUiLoaderService,
    private snackbar: SnackBarService,
    private trainerService: TrainerService
  ) { }

  ngOnInit(): void {
    this.subscriptionForm = this.fb.group({
      activationCode: ['', [Validators.required, Validators.minLength(3)]],
      durationTier: ['', Validators.required],
    });
  }

  get selectedPlan(): PlanOption | undefined {
    const val = this.subscriptionForm.get('durationTier')?.value;
    return this.plans.find(p => p.value === val);
  }

  selectPlan(value: string): void {
    this.subscriptionForm.get('durationTier')?.setValue(value);
    this.subscriptionForm.get('durationTier')?.markAsDirty();
  }

  submitSubscription(): void {
    if (this.subscriptionForm.invalid) {
      this.subscriptionForm.markAllAsTouched();
      this.subscriptionForm.markAsDirty();
      this.snackbar.openSnackBar('Please fill in all required fields.', 'error');
      return;
    }

    const payload = {
      activationCode: this.subscriptionForm.get('activationCode')?.value?.trim().toUpperCase(),
      durationTier: this.subscriptionForm.get('durationTier')?.value,
    };

    this.loader.start();

    this.trainerService.addTrainerSubscription(payload)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.snackbar.openSnackBar(res?.message || 'Subscription activated successfully!', '');
          this.savedEvent.emit();
          this.closeModal();
          this.loader.stop();
        },
        error: (err: any) => {
          this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
          this.loader.stop();
        }
      });
  }

  closeModal(): void {
    this.closeEvent.emit();
  }
}