import { group } from '@angular/animations';
import { DatePipe, formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { map, Subscription } from 'rxjs';
import { TrainerBenefits } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { genericError, minArrayLength } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-trainer-benefits',
  templateUrl: './trainer-benefits.component.html',
  styleUrls: ['./trainer-benefits.component.css']
})
export class TrainerBenefitsComponent {
  @Output() emitEvent = new EventEmitter();
  updateTrainerBenefitForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  selectedtrainerBenefit: any;
  @Input() trainerBenefit!: TrainerBenefits;
  subscriptions: Subscription[] = [];

  constructor(private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private trainerService: TrainerService,
    private trainerStateService: TrainerStateService,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.trainerBenefit = this.trainerBenefit || {};
    this.initForm();
  }

  initForm(): void {
    this.updateTrainerBenefitForm = this.formBuilder.group({
      'id': this.trainerBenefit.id,
      'benefits': this.formBuilder.array(this.initBenefits(), minArrayLength(5))
    });
  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  initBenefits(): FormGroup[] {
    return this.trainerBenefit.benefits?.map((benefit: string) => this.newBenefit(benefit)) || [this.newBenefit()];
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.trainerStateService.getMyTrainerBenefits().subscribe((trainerBenefit) => {
        this.trainerBenefit = trainerBenefit;
      }),
    );
  }

  getBenefits(): FormArray {
    return this.updateTrainerBenefitForm.get('benefits') as FormArray;
  }

  newBenefit(benefit: string = ''): FormGroup {
    return this.formBuilder.group({
      'benefit': [benefit, [Validators.required, Validators.minLength(15)]],
    });
  }

  addBenefitField() {
    this.getBenefits().push(this.newBenefit());
  }

  setBenefitsArray(benefits: string[]): void {
    const benefitsArray = this.getBenefits();
    benefitsArray.clear();
    benefits.forEach(benefit => benefitsArray.push(this.newBenefit(benefit)));
  }

  removeBenefitField(index: number) {
    this.getBenefits().removeAt(index);
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  updateTrainerBenefit(): void {
    if (this.updateTrainerBenefitForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      return;
    }

    // Transform form data before sending
    const benefits = this.updateTrainerBenefitForm.value.benefits.map((benefit: any) => benefit.benefit);
    const benefitString = benefits.join('#');
    const transformedData = {
      id: this.trainerBenefit.id,
      benefits: benefitString
    };

    console.log("printing form data: ", transformedData)

    this.ngxService.start();
    if (this.trainerBenefit.id) {

      // Update existing trainer pricing
      this.trainerService.updateTrainerBenefit(transformedData)
        .subscribe((response: any) => {
          this.updateTrainerBenefitForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.handleEmitEvent()
          this.emitEvent.emit();
          this.setBenefitsArray(benefits)
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
      this.trainerService.addTrainerBenefit(transformedData)
        .subscribe((response: any) => {
          this.updateTrainerBenefitForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.trainerBenefit.benefits = benefits;
          this.snackBarService.openSnackBar(this.responseMessage, "");
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
    this.updateTrainerBenefitForm.reset();
  }
}


