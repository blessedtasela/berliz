import { ChangeDetectorRef, Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TrainerPricing } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-update-trainer-pricing-modal',
  templateUrl: './update-trainer-pricing-modal.component.html',
  styleUrls: ['./update-trainer-pricing-modal.component.css']
})
export class UpdateTrainerPricingModalComponent {
  onUpdateTrainerPricingEmit = new EventEmitter();
  updateTrainerPricingForm!: FormGroup;
  invalidForm: boolean = false;
  trainerPricing!: TrainerPricing;
  responseMessage: any;


  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UpdateTrainerPricingModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private trainerService: TrainerService,
    @Inject(MAT_DIALOG_DATA) public data: any,) {
    this.trainerPricing = data.trainerPricingData;
  }

  ngOnInit(): void {
    this.updateTrainerPricingForm = this.formBuilder.group({
      'id': new FormControl(this.trainerPricing.id, Validators.required),
      'priceOnline': new FormControl(this.trainerPricing.priceOnline, Validators.compose([Validators.required, Validators.minLength(1)])),
      'priceHybrid': new FormControl(this.trainerPricing.priceHybrid, Validators.compose([Validators.required, Validators.minLength(1)])),
      'pricePersonal': new FormControl(this.trainerPricing.pricePersonal, Validators.compose([Validators.required, Validators.minLength(1)])),
      'discount3Months': new FormControl(this.trainerPricing.discount3Months, Validators.compose([Validators.required, Validators.minLength(1)])),
      'discount6Months': new FormControl(this.trainerPricing.discount6Months, Validators.compose([Validators.required, Validators.minLength(1)])),
      'discount9Months': new FormControl(this.trainerPricing.discount9Months, Validators.compose([Validators.required, Validators.minLength(1)])),
      'discount12Months': new FormControl(this.trainerPricing.discount12Months, Validators.compose([Validators.required, Validators.minLength(1)])),
      'discount2Programs': new FormControl(this.trainerPricing.discount2Programs, Validators.compose([Validators.required, Validators.minLength(1)])),
    });
}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without updating trainer aplication')
  }

  updateTrainerPricing(): void {
    if (this.updateTrainerPricingForm.invalid) {
      this.ngxService.start();
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      this.ngxService.start();
      this.trainerService.updateTrainerPricing(this.updateTrainerPricingForm.value)
        .subscribe((response: any) => {
          this.updateTrainerPricingForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('TrainerPricing updated successfully');
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.onUpdateTrainerPricingEmit.emit();
        }, (error: any) => {
          this.ngxService.start();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error");
          this.ngxService.stop();
        })
      this.ngxService.stop();
    }
  }

  clear() {
    this.updateTrainerPricingForm.reset();
  }
}

