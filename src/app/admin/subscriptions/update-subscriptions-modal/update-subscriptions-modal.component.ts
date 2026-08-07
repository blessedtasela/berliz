import { ChangeDetectorRef, Component, EventEmitter, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, combineLatest } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { CenterPricing, Centers } from 'src/app/models/centers.interface';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { TrainerPricing, Trainers } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { genericError } from 'src/validators/form-validators.module';
import { selectTrainerPricing, selectTrainers } from 'src/app/state/trainer/trainer.selector';
import { selectCenterPricing, selectCenters } from 'src/app/state/center/center.selectors';
import { selectCategories } from 'src/app/state/category/category.selectors';
import { loadAllCenterPricing, loadCenters } from 'src/app/state/center/center.actions';
import { loadActiveTrainers, loadTrainerPricing } from 'src/app/state/trainer/trainer.actions';
import { loadActiveCategories } from 'src/app/state/category/category.actions';

@Component({
  selector: 'app-update-subscriptions-modal',
  templateUrl: './update-subscriptions-modal.component.html',
  styleUrls: ['./update-subscriptions-modal.component.css']
})
export class UpdateSubscriptionsModalComponent {
  onUpdateSubscriptionEmit = new EventEmitter();
  updateSubscriptionForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  subscriptionData!: Subscriptions;
  trainers: Trainers[] = [];
  centers: Centers[] = [];
  categories: Categories[] = [];
  subscriptions: Subscription[] = [];
  trainerPricing: TrainerPricing[] = [];
  centerPricing: CenterPricing[] = [];
  selectedTrainer!: Trainers;
  selectedCenter!: Centers;
  totalAmount: any = 0;
  months: any[] = [
    { id: 1, month: 1, amount: "" },
    { id: 2, month: 3, amount: "" },
    { id: 3, month: 6, amount: "" },
    { id: 4, month: 9, amount: "" },
    { id: 5, month: 12, amount: "" },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { subscriptionData: Subscriptions },
    private formBuilder: FormBuilder,
    private subscriptionService: SubscriptionService,
    private store: Store,
    public dialogRef: MatDialogRef<UpdateSubscriptionsModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService) {
    this.subscriptionData = this.data.subscriptionData;
    this.totalAmount = this.subscriptionData.amount;
  }

  ngOnInit(): void {
    this.updateSubscriptionForm = this.formBuilder.group({
      'months': [this.subscriptionData.months, [Validators.required, Validators.minLength(1)]],
      'mode': [this.subscriptionData.mode, [Validators.required, Validators.minLength(1)]],
      'trainerId': [this.subscriptionData.trainer?.id ?? '',],
      'centerId': [this.subscriptionData.center?.id ?? '',],
      'categoryIds': this.formBuilder.array(
        (this.subscriptionData.categories || []).map(category =>
          this.formBuilder.group({ categoryIds: String(category.id) })
        ),
        this.validateCheckbox()
      ),
    });

    combineLatest([
      this.store.select(selectCenters),
      this.store.select(selectTrainers),
      this.store.select(selectCategories),
      this.store.select(selectTrainerPricing),
      this.store.select(selectCenterPricing)
    ]).subscribe(([centers, trainers, categories, trainerPricing, centerPricing]) => {

      if (!centers?.length) this.store.dispatch(loadCenters());
      else this.centers = centers;

      if (!trainers?.length) this.store.dispatch(loadActiveTrainers());
      else this.trainers = trainers;

      if (!categories?.length) this.store.dispatch(loadActiveCategories());
      else this.categories = categories;

      if (!trainerPricing?.length) this.store.dispatch(loadTrainerPricing());
      else this.trainerPricing = trainerPricing;

      if (!centerPricing?.length) this.store.dispatch(loadAllCenterPricing());
      else this.centerPricing = centerPricing;

      this.initializeSelections();
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  initializeSelections(): void {
    const trainerId = this.updateSubscriptionForm?.get('trainerId')?.value;
    const centerId = this.updateSubscriptionForm?.get('centerId')?.value;

    if (trainerId && this.trainers.length) {
      this.selectedTrainer = this.trainers.find(trainer => trainer.id === +trainerId)!;
    }
    if (centerId && this.centers.length) {
      this.selectedCenter = this.centers.find(center => center.id === +centerId)!;
    }
    if (this.selectedTrainer && this.selectedCenter && this.trainerPricing.length && this.centerPricing.length) {
      this.calculateTotalAmount();
    }
  }

  onTrainerSelected(event: any): void {
    const id = +event.target.value;
    const selectedTrainer = this.trainers.find(trainer => trainer.id === id);
    if (selectedTrainer) {
      this.selectedTrainer = selectedTrainer;
      this.calculateTotalAmount();
    }
  }

  onCenterSelected(event: any): void {
    const id = +event.target.value;
    const selectedCenter = this.centers.find(center => center.id === id);
    if (selectedCenter) {
      this.selectedCenter = selectedCenter;
      this.calculateTotalAmount();
    }
  }

  calculateTotalAmount(): void {
    if (!this.selectedTrainer || !this.selectedCenter) {
      return;
    }

    const selectedTrainerPricing = this.trainerPricing.find(
      (trainerPricing) => trainerPricing.trainerId === this.selectedTrainer.id
    );

    const selectedCenterPricing = this.centerPricing.find(
      (centerPricing) => centerPricing.centerId === this.selectedCenter.id
    );

    if (!selectedTrainerPricing || !selectedCenterPricing) {
      return;
    }

    const selectedMode = this.updateSubscriptionForm.get('mode')?.value;
    const selectedMonths = Number(this.updateSubscriptionForm.get('months')?.value);
    const selectedCategoriesCount = this.updateSubscriptionForm.get('categoryIds')?.value.length;

    const calculateDiscount = (basePrice: number, discountPercentage: number, months: number): number => {
      let discountedPrice = basePrice;
      if (months > 1) {
        discountedPrice -= (basePrice * discountPercentage) / 100;
        discountedPrice *= months;
      }
      return discountedPrice;
    };

    const calculate2ProgramsDiscount = (basePrice: number, discountPercentage: number): number => {
      return basePrice - (basePrice * discountPercentage) / 100;
    };

    interface GetTrainerPrice {
      priceOnline: number;
      priceHybrid: number;
      pricePersonal: number;
      discount3Months: number;
      discount6Months: number;
      discount9Months: number;
      discount12Months: number;
      discount2Programs: number;
    }

    const priceKey =
      selectedMode === 'online'
        ? 'priceOnline'
        : selectedMode === 'hybrid'
          ? 'priceHybrid'
          : 'pricePersonal';

    const discountKey = `discount${selectedMonths}Months` as keyof GetTrainerPrice;

    const trainerBasePrice = selectedTrainerPricing[priceKey] as unknown as number;
    const trainerDiscountValue = selectedTrainerPricing[discountKey] as unknown as number;

    let trainerDiscount = calculateDiscount(
      trainerBasePrice,
      trainerDiscountValue,
      selectedMonths
    );

    if (selectedCategoriesCount === 2) {
      trainerDiscount = calculate2ProgramsDiscount(
        trainerDiscount,
        selectedTrainerPricing.discount2Programs as unknown as number
      );
    }

    interface GetCenterPrice {
      price: number;
      discount3Months: number;
      discount6Months: number;
      discount9Months: number;
      discount12Months: number;
      discount2Programs: number;
    }

    const centerBasePrice = selectedCenterPricing.price as unknown as number;
    const centerDiscountValue =
      selectedCenterPricing[`discount${selectedMonths}Months` as keyof GetCenterPrice] as unknown as number;

    let centerDiscount = calculateDiscount(
      centerBasePrice,
      centerDiscountValue,
      selectedMonths
    );

    if (selectedCategoriesCount === 2) {
      centerDiscount = calculate2ProgramsDiscount(
        centerDiscount,
        selectedCenterPricing.discount2Programs
      );
    }

    this.totalAmount = trainerDiscount + centerDiscount;
  }

  formatTotalAmount(amount: any) {
    return amount.toFixed(2);
  }

  isCategoryChecked(categoryId: number): boolean {
    const categoryIds = this.updateSubscriptionForm.get('categoryIds') as FormArray;
    return categoryIds.controls.some((control) => control.value.categoryIds === String(categoryId));
  }

  onCheckboxChanged(event: any) {
    const categories = this.updateSubscriptionForm.get('categoryIds') as FormArray;
    if (event.target.checked) {
      if (categories.length < 2) {
        categories.push(this.formBuilder.group({ categoryIds: event.target.value }));
      } else {
        event.target.checked = false;
      }
    } else {
      const index = categories.controls.findIndex((control) => control.value.categoryIds === event.target.value);
      categories.removeAt(index);
    }
  }

  validateCheckbox(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const checkboxes = formArray.value;
      const isChecked = checkboxes.length > 0 && checkboxes.length <= 2;
      return isChecked ? null : { noCheckboxChecked: true };
    };
  }

  updateSubscription(): void {
    this.ngxService.start();
    if (this.updateSubscriptionForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = "Invalid form";
      this.ngxService.stop();
      this.snackbarService.openSnackBar(this.responseMessage, "error");
    } else {
      const selectedTagIds = this.updateSubscriptionForm.value.categoryIds.map((category: any) => category.categoryIds);
      const categoryIdsString = selectedTagIds.join(',');
      const formData = {
        ...this.updateSubscriptionForm.value,
        id: this.subscriptionData.id,
        userId: this.subscriptionData.user.id,
        categoryIds: categoryIdsString
      };
      this.subscriptionService.updateSubscription(formData)
        .subscribe((response: any) => {
          this.onUpdateSubscriptionEmit.emit();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.dialogRef.close('Subscription updated successfully');
        }, (error: any) => {
          this.ngxService.stop();
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, "error");
        });
    }
    this.ngxService.stop();
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without updating the subscription');
  }
}
