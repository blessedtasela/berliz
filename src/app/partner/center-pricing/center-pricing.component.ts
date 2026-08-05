import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { Centers, CenterPricing } from 'src/app/models/centers.interface';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadMyCenterPricing } from 'src/app/state/center/center.actions';
import { selectMyCenterPricing } from 'src/app/state/center/center.selectors';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-center-pricing',
  templateUrl: './center-pricing.component.html',
  styleUrls: ['./center-pricing.component.css']
})
export class CenterPricingComponent implements OnInit, OnChanges, OnDestroy {

  @Input() center!: Centers | null;
  @Output() emitEvent = new EventEmitter();

  centerPricing: CenterPricing | null = null;
  updateCenterPricingForm!: FormGroup;

  invalidForm = false;
  originalValue: any;

  pricingFields = [
    { name: 'price', label: 'Membership Price', placeholder: '59.99' },
    { name: 'discount3Months', label: 'Discount 3 Months', placeholder: '9.99 %' },
    { name: 'discount6Months', label: 'Discount 6 Months', placeholder: '9.99 %' },
    { name: 'discount9Months', label: 'Discount 9 Months', placeholder: '9.99 %' },
    { name: 'discount12Months', label: 'Discount 12 Months', placeholder: '9.99 %' },
    { name: 'discount2Programs', label: 'Discount 2 Programs', placeholder: '9.99 %' },
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private loader: NgxUiLoaderService,
    private snackbar: SnackBarService,
    private centerService: CenterService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    if (!this.updateCenterPricingForm) {
      this.initForm();
    }
    this.handleEmitEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['center']?.currentValue && this.updateCenterPricingForm) {
      this.updateCenterPricingForm.patchValue({ centerId: this.center?.id });
      this.originalValue = this.updateCenterPricingForm.getRawValue();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent(): void {
    this.store.dispatch(loadMyCenterPricing());
    this.subscriptions.push(
      this.store.select(selectMyCenterPricing).subscribe(pricing => {
        this.centerPricing = pricing;
        this.initForm();
      })
    );
  }

  private initForm(): void {
    if (this.updateCenterPricingForm) {
      this.updateFormValues(this.centerPricing);
    } else {
      this.updateCenterPricingForm = this.fb.group({
        id: [this.centerPricing?.id ?? null],
        centerId: [this.centerPricing?.centerId ?? this.center?.id ?? null],
        price: [this.centerPricing?.price ?? null, Validators.required],
        discount3Months: [this.centerPricing?.discount3Months ?? null, Validators.required],
        discount6Months: [this.centerPricing?.discount6Months ?? null, Validators.required],
        discount9Months: [this.centerPricing?.discount9Months ?? null, Validators.required],
        discount12Months: [this.centerPricing?.discount12Months ?? null, Validators.required],
        discount2Programs: [this.centerPricing?.discount2Programs ?? null, Validators.required],
      });
    }

    this.updateCenterPricingForm.markAsPristine();
    this.updateCenterPricingForm.markAsUntouched();
    this.originalValue = this.updateCenterPricingForm.getRawValue();
  }

  private updateFormValues(pricing: CenterPricing | null): void {
    this.updateCenterPricingForm.patchValue({
      id: pricing?.id ?? null,
      centerId: pricing?.centerId ?? this.center?.id ?? null,
      price: pricing?.price ?? null,
      discount3Months: pricing?.discount3Months ?? null,
      discount6Months: pricing?.discount6Months ?? null,
      discount9Months: pricing?.discount9Months ?? null,
      discount12Months: pricing?.discount12Months ?? null,
      discount2Programs: pricing?.discount2Programs ?? null,
    });
  }

  hasChanges(): boolean {
    if (!this.updateCenterPricingForm) return false;
    return JSON.stringify(this.updateCenterPricingForm.getRawValue())
      !== JSON.stringify(this.originalValue);
  }

  updateCenterPricing(): void {
    if (this.updateCenterPricingForm.invalid) {
      this.invalidForm = true;
      this.updateCenterPricingForm.markAllAsTouched();
      this.snackbar.openSnackBar('Invalid form. Please complete all sections', 'error');
      return;
    }

    const payload = this.updateCenterPricingForm.getRawValue();

    this.loader.start();

    const request$ = payload.id
      ? this.centerService.updatePricing(payload)
      : this.centerService.addPricing(payload);

    request$.pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Saved successfully', '');
        this.clear(response?.data ?? response);
        this.store.dispatch(loadMyCenterPricing());
        this.emitEvent.emit();
        this.loader.stop();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  private clear(updated: CenterPricing): void {
    if (updated?.id) {
      this.centerPricing = updated;
      this.updateFormValues(updated);
    }

    this.invalidForm = false;
    this.updateCenterPricingForm.markAsPristine();
    this.updateCenterPricingForm.markAsUntouched();
    this.updateCenterPricingForm.updateValueAndValidity();
    this.originalValue = this.updateCenterPricingForm.getRawValue();
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }
}
