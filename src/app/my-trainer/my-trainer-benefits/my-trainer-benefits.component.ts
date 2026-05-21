import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { TrainerBenefits } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { minArrayLength, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-my-trainer-benefits',
  templateUrl: './my-trainer-benefits.component.html',
  styleUrls: ['./my-trainer-benefits.component.css']
})
export class MyTrainerBenefitsComponent {

  @Output() emitEvent = new EventEmitter();
  @Input() trainerBenefit!: TrainerBenefits;

  updateTrainerBenefitForm!: FormGroup;
  invalidForm = false;
  responseMessage: string = '';
  subscriptions: Subscription[] = [];

  originalValue: any;

  constructor(
    private fb: FormBuilder,
    private loader: NgxUiLoaderService,
    private snackbar: SnackBarService,
    private trainerService: TrainerService,
    private trainerState: TrainerStateService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.trainerBenefit = this.trainerBenefit || {};
    this.initForm();
    this.originalValue = this.updateTrainerBenefitForm.getRawValue();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // -----------------------------
  // INIT FORM
  // -----------------------------
  initForm(): void {
    this.updateTrainerBenefitForm = this.fb.group({
      id: [this.trainerBenefit.id],
      benefits: this.fb.array(this.initBenefits(), minArrayLength(5))
    });
  }

  initBenefits(): FormGroup[] {
    return this.trainerBenefit.benefits?.map(b => this.newBenefit(b)) || [this.newBenefit()];
  }

  newBenefit(value: string = ''): FormGroup {
    return this.fb.group({
      benefit: [value, [Validators.required, Validators.minLength(15)]]
    });
  }

  getBenefits(): FormArray {
    return this.updateTrainerBenefitForm.get('benefits') as FormArray;
  }

  addBenefitField(): void {
    this.getBenefits().push(this.newBenefit());
  }

  removeBenefitField(index: number): void {
    this.getBenefits().removeAt(index);
  }

  setBenefitsArray(benefits: string[]): void {
    const arr = this.getBenefits();
    arr.clear();
    benefits.forEach(b => arr.push(this.newBenefit(b)));
  }

  // -----------------------------
  // UPDATE BENEFITS
  // -----------------------------
  updateTrainerBenefit(): void {

    if (this.updateTrainerBenefitForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackbar.openSnackBar(this.responseMessage, "error");
      return;
    }

    // 1️⃣ Extract benefits
    const benefits = this.updateTrainerBenefitForm.value.benefits.map((b: any) => b.benefit.trim());

    // 2️⃣ Check duplicates (case-insensitive)
    const lower = benefits.map((b: any) => b.toLowerCase());
    const hasDuplicates = new Set(lower).size !== lower.length;

    if (hasDuplicates) {

      this.invalidForm = true;
      this.snackbar.openSnackBar(
        "Duplicate benefits detected. Please remove repeated items.",
        "error"
      );
      return;
    }

    const payload = {
      id: this.trainerBenefit.id,
      benefits: benefits
    };

    this.loader.start();
    const request$ = this.trainerBenefit.id
      ? this.trainerService.updateTrainerBenefit(payload)
      : this.trainerService.addTrainerBenefit(payload);

    request$.subscribe({
      next: (response: any) => {
        this.invalidForm = false;
        this.responseMessage = response?.message;
        this.snackbar.openSnackBar(this.responseMessage, "");

        // ⭐ Update UI using backend DTO
        this.updateUIFromResponse(response);
        this.emitEvent.emit();
        this.loader.stop();
      },

      error: (err: any) => {
        console.error("🔥 Backend error:", err);
        this.responseMessage = err.error?.message || genericError;
        this.snackbar.openSnackBar(this.responseMessage, "error");
        this.loader.stop();
      }
    });
  }

  // -----------------------------
  // UPDATE UI FROM BACKEND RESPONSE
  // -----------------------------
  updateUIFromResponse(updated: TrainerBenefits): void {

    // 1️⃣ Update local component state
    this.trainerBenefit = updated;

    // 2️⃣ Update form fields
    this.updateTrainerBenefitForm.patchValue({
      id: updated.id
    });

    // 3️⃣ Update benefits array
    this.setBenefitsArray(updated.benefits);

    // 4️⃣ Reset form state
    this.updateTrainerBenefitForm.markAsPristine();
    this.updateTrainerBenefitForm.markAsUntouched();
    this.updateTrainerBenefitForm.updateValueAndValidity();

    // 5️⃣ Save new original value for change detection
    this.originalValue = this.updateTrainerBenefitForm.getRawValue();
  }

  // -----------------------------
  // CHANGE DETECTION
  // -----------------------------
  hasChanges(): boolean {
    const current = JSON.stringify(this.updateTrainerBenefitForm.getRawValue());
    const original = JSON.stringify(this.originalValue);
    return current !== original;
  }

  clear(): void {
    this.updateTrainerBenefitForm.reset();
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}

