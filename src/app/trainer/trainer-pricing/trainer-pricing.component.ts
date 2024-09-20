import { group } from '@angular/animations';
import { DatePipe, formatDate } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { TrainerPricing } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-trainer-pricing',
  templateUrl: './trainer-pricing.component.html',
  styleUrls: ['./trainer-pricing.component.css']
})
export class TrainerPricingComponent {
  @Output() emitEvent = new EventEmitter();
  updateTrainerPricingForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  @Input() trainerPricing!: TrainerPricing;
  subscriptions: Subscription[] = [];

  pricingFields = [
    { name: 'priceOnline', label: 'Price Online', placeholder: '$59.99' },
    { name: 'pricePersonal', label: 'Price Personal', placeholder: '$59.99' },
    { name: 'priceHybrid', label: 'Price Hybrid', placeholder: '$59.99' },
    { name: 'discount3Months', label: 'Discount 3 Months', placeholder: '9.99 %' },
    { name: 'discount6Months', label: 'Discount 6 Months', placeholder: '9.99 %' },
    { name: 'discount9Months', label: 'Discount 9 Months', placeholder: '9.99 %' },
    { name: 'discount12Months', label: 'Discount 12 Months', placeholder: '9.99 %' },
    { name: 'discount2Programs', label: 'Discount 2 Programs', placeholder: '9.99 %' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private trainerService: TrainerService,
    private trainerStateService: TrainerStateService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.trainerPricing = this.trainerPricing || {};
    this.updateTrainerPricingForm = this.formBuilder.group({
      id: [this.trainerPricing.id],
      priceOnline: [this.trainerPricing.priceOnline, Validators.required],
      pricePersonal: [this.trainerPricing.pricePersonal, Validators.required],
      priceHybrid: [this.trainerPricing.priceHybrid, Validators.required],
      discount3Months: [this.trainerPricing.discount3Months, Validators.required],
      discount6Months: [this.trainerPricing.discount6Months, Validators.required],
      discount9Months: [this.trainerPricing.discount9Months, Validators.required],
      discount12Months: [this.trainerPricing.discount12Months, Validators.required],
      discount2Programs: [this.trainerPricing.discount2Programs, Validators.required],
    });
  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.trainerStateService.getMyTrainerPricing().subscribe((trainerPricing) => {
        this.trainerPricing = trainerPricing;
      })
    );
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  updateFormValues(trainerPricing: TrainerPricing) {
    this.updateTrainerPricingForm.patchValue({
      id: trainerPricing.id,
      priceOnline: trainerPricing.priceOnline,
      pricePersonal: trainerPricing.pricePersonal,
      priceHybrid: trainerPricing.priceHybrid,
      discount3Months: trainerPricing.discount3Months,
      discount6Months: trainerPricing.discount6Months,
      discount9Months: trainerPricing.discount9Months,
      discount12Months: trainerPricing.discount12Months,
      discount2Programs: trainerPricing.discount2Programs
    });
  }

  updateTrainerPricing(): void {
    if (this.updateTrainerPricingForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = 'Invalid form. Please complete all sections';
      this.snackBarService.openSnackBar(this.responseMessage, 'error');
      return; // Exit early if the form is invalid
    }

    const trainerPricing = this.updateTrainerPricingForm.value;

    this.ngxService.start();
    if (this.trainerPricing.id) {
      // Update existing trainer pricing
      this.trainerService.updateTrainerPricing(trainerPricing).subscribe(
        (response: any) => {
          this.updateTrainerPricingForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent();
          this.emitEvent.emit();
          this.updateFormValues(trainerPricing)
          this.ngxService.stop();
        },
        (error: any) => {
          console.error('error');
          this.responseMessage = error.error?.message || genericError;
          this.snackBarService.openSnackBar(this.responseMessage, 'error');
          this.ngxService.stop();
        }
      );
    } else {
      // Add new trainer pricing
      this.trainerService.addTrainerPricing(trainerPricing).subscribe(
        (response: any) => {
          this.updateTrainerPricingForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent();
          this.emitEvent.emit();
          this.updateFormValues(trainerPricing)
          this.ngxService.stop();
        },
        (error: any) => {
          console.error('error');
          this.responseMessage = error.error?.message || genericError;
          this.snackBarService.openSnackBar(this.responseMessage, 'error');
          this.ngxService.stop();
        }
      );
    }
  }

  clear() {
    this.updateTrainerPricingForm.reset();
  }
}
