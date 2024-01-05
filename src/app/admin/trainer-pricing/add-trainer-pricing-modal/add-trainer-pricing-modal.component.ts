import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Trainers } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { genericError } from 'src/validators/form-validators.module';
import { TrainerStateService } from 'src/app/services/trainer-state.service';

@Component({
  selector: 'app-add-trainer-pricing-modal',
  templateUrl: './add-trainer-pricing-modal.component.html',
  styleUrls: ['./add-trainer-pricing-modal.component.css']
})
export class AddTrainerPricingModalComponent {
  onAddTrainerPricingEmit = new EventEmitter();
  addTrainerPricingForm!: FormGroup;
  invalidForm: boolean = false;
  trainers: Trainers[] = [];
  responseMessage: any;
  selectedTrainer!: Trainers | null;

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddTrainerPricingModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private trainerStateService: TrainerStateService,
    private trainerService: TrainerService,) { }

  ngOnInit(): void {
    this.addTrainerPricingForm = this.formBuilder.group({
      'trainerId': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'priceOnline': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'priceHybrid': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'pricePersonal': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'discount3Months': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'discount6Months': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'discount9Months': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'discount12Months': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'discount2Programs': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
    });
    this.onEmit();
  }


  onEmit(): void {
    this.trainerStateService.allTrainersData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.trainers = cachedData;
      }
    });
  }

  handleEmitEvent() {
    this.trainerStateService.getActiveTrainers().subscribe((activeTrainers) => {
      this.trainers = activeTrainers;
      this.trainerStateService.setActiveTrainersSubject(activeTrainers);
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without completing trainer aplication')
  }

  onTrainerSelected(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedTrainer = this.trainers.find(trainer => trainer.id === +id) || null;
  }

  addTrainerPricing(): void {
    if (this.addTrainerPricingForm.invalid) {
      this.ngxService.start();
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      this.ngxService.start();
      this.trainerService.addTrainerPricing(this.addTrainerPricingForm.value)
        .subscribe((response: any) => {
          this.addTrainerPricingForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('TrainerPricing added successfully');
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.onAddTrainerPricingEmit.emit();
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
    this.addTrainerPricingForm.reset();
    this.selectedTrainer = null;
  }
}
