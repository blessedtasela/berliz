import { DatePipe } from '@angular/common';
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
  isChecked: boolean = false;
  responseMessage: any;
  selectedImage: any;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper: boolean = false;
  @Input() trainerPricing!: TrainerPricing;
  selectedCategoriesId: any;
  subscriptions: Subscription[] = [];

  constructor(private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private trainerService: TrainerService,
    private trainerStateService: TrainerStateService,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.trainerPricing = this.trainerPricing || {};
    this.updateTrainerPricingForm = this.formBuilder.group({
      'id': this.trainerPricing.id,
      'priceOnline': new FormControl(this.trainerPricing.priceOnline, Validators.compose([Validators.required, Validators.minLength(2)])),
      'pricePersonal': new FormControl(this.trainerPricing.pricePersonal, Validators.compose([Validators.required, Validators.minLength(2)])),
      'priceHybrid': new FormControl(this.trainerPricing.priceHybrid, Validators.compose([Validators.required, Validators.minLength(2)])),
      'discount3Months': new FormControl(this.trainerPricing.discount3Months, Validators.compose([Validators.required, Validators.minLength(2)])),
      'discount6Months': new FormControl(this.trainerPricing.discount6Months, Validators.compose([Validators.required, Validators.minLength(2)])),
      'discount9Months': new FormControl(this.trainerPricing.discount9Months, Validators.compose([Validators.required, Validators.minLength(2)])),
      'discount12Months': new FormControl(this.trainerPricing.discount12Months, Validators.compose([Validators.required, Validators.minLength(2)])),
      'discount2Programs': new FormControl(this.trainerPricing.discount2Programs, Validators.compose([Validators.required, Validators.minLength(2)])),
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
      }),
    );
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  updateTrainerPricing(): void {
    if (this.updateTrainerPricingForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      return; // Exit early if the form is invalid
    }

    this.ngxService.start();
    if (this.trainerPricing.id) {
      // Update existing trainer pricing
      this.updateTrainerPricingForm.patchValue({
        id: this.trainerPricing.id
      });

      this.trainerService.updateTrainerPricing(this.updateTrainerPricingForm.value)
        .subscribe((response: any) => {
          this.updateTrainerPricingForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.showCropper = false
          this.handleEmitEvent()
          this.emitEvent.emit();
          this.isChecked = false;
          this.ngxService.stop();
        }, (error: any) => {
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error");
          this.ngxService.stop();
        });
    } else {
      // Add new trainer pricing
      this.trainerService.addTrainerPricing(this.updateTrainerPricingForm.value)
        .subscribe((response: any) => {
          this.updateTrainerPricingForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.showCropper = false
          this.handleEmitEvent()
          this.emitEvent.emit();
          this.ngxService.stop();
        }, (error: any) => {
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error");
          this.ngxService.stop();
        });
    }
  }

  clear() {
    this.updateTrainerPricingForm.reset();
  }
}


