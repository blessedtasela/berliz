import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, forkJoin, take } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { Centers } from 'src/app/models/centers.interface';
import { Clients } from 'src/app/models/clients.interface';
import { TrainerPricing, Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { CenterStateService } from 'src/app/services/center-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-add-subscriptions-modal',
  templateUrl: './add-subscriptions-modal.component.html',
  styleUrls: ['./add-subscriptions-modal.component.css']
})
export class AddSubscriptionsModalComponent {
  onAddSubscriptionEmit = new EventEmitter();
  addSubscriptionForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  users: Users[] = [];
  trainers: Trainers[] = [];
  centers: Centers[] = [];
  categories: Categories[] = [];
  subscriptions: Subscription[] = [];
  trainerPricing: TrainerPricing[] = [];
  selectedTrainer!: Trainers;
  totalAmount: any = 0;
  months: any[] = [
    { id: 1, month: 1, amount: "" },
    { id: 2, month: 3, amount: "" },
    { id: 3, month: 6, amount: "" },
    { id: 4, month: 9, amount: "" },
    { id: 5, month: 12, amount: "" },
  ];


  constructor(private formBuilder: FormBuilder,
    private subscriptionService: SubscriptionService,
    private userStateService: UserStateService,
    private trainerStateService: TrainerStateService,
    private centerStateService: CenterStateService,
    public dialogRef: MatDialogRef<AddSubscriptionsModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService,
    private categoryStateService: CategoryStateService,) {
  }

  ngOnInit(): void {
    this.addSubscriptionForm = this.formBuilder.group({
      'userId': ['', [Validators.required, Validators.minLength(1)]],
      'months': ['', [Validators.required, Validators.minLength(1)]],
      'mode': ['', [Validators.required, Validators.minLength(1)]],
      'trainerId': ['',],
      'centerId': ['',],
      'categoryIds': this.formBuilder.array([], this.validateCheckbox()),
    });

    forkJoin([
      this.centerStateService.activeCentersData$.pipe(take(1)),
      this.trainerStateService.activeTrainersData$.pipe(take(1)),
      this.userStateService.activeUserData$.pipe(take(1)),
      this.categoryStateService.activeCategoriesData$.pipe(take(1)),
      this.trainerStateService.trainerPricingData$.pipe(take(1))
    ]).subscribe(([centers, trainers, users, categories, trainerPricing]) => {
      if (centers === null) {
        this.handleEmitEvent()
      } else {
        this.centers = centers;
      }
      if (trainers === null) {
        this.handleEmitEvent()
      } else {
        this.trainers = trainers
      }
      if (users === null) {
        this.handleEmitEvent()
      } else {
        this.users = users
      }
      if (categories === null) {
        this.handleEmitEvent()
      } else {
        this.categories = categories
      }
      if (trainerPricing === null) {
        this.handleEmitEvent()
      } else {
        this.trainerPricing = trainerPricing
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  handleEmitEvent() {
    console.log("isCached false");
    this.subscriptions.push(
      this.userStateService.getActiveUsers().subscribe((users) => {
        this.ngxService.start();
        this.users = users;
        this.userStateService.setActiveUsersSubject(users);
        this.cd.detectChanges();
        this.ngxService.stop();
      }),
      this.trainerStateService.getActiveTrainers().subscribe((trainers) => {
        this.ngxService.start();
        this.trainers = trainers;
        this.trainerStateService.setActiveTrainersSubject(trainers);
        this.cd.detectChanges();
        this.ngxService.stop();
      }),
      this.centerStateService.getActiveCenters().subscribe((centers) => {
        this.ngxService.start();
        this.centers = centers;
        this.centerStateService.setAllCentersSubject(centers);
        this.cd.detectChanges();
        this.ngxService.stop();
      }),
      this.categoryStateService.getActiveCategories().subscribe((categories) => {
        this.ngxService.start();
        this.categories = categories;
        this.categoryStateService.setActiveCategoriesSubject(categories);
        this.cd.detectChanges();
        this.ngxService.stop();
      }),
      this.trainerStateService.getTrainerPricing().subscribe((trainerPricing) => {
        this.ngxService.start();
        this.trainerPricing = trainerPricing;
        this.trainerStateService.setTrainerPricingSubject(trainerPricing);
        this.cd.detectChanges();
        this.ngxService.stop();
      })
    );
  }

  onTrainerSelected(event: any): void {
    console.log("onTrainerSelectedCalled")
    const id = +event.target.value;
    const selectedTrainer = this.trainers.find(trainer => trainer.id === id);
    if (selectedTrainer) {
      this.selectedTrainer = selectedTrainer;
      this.calculateTotalAmount(selectedTrainer);
    }
    else {
      console.log('trainer not found')
    }
  }

  calculateTotalAmount(selectedTrainer: Trainers): void {
    if (!selectedTrainer) {
      console.log('trainer is null')
    }
    this.selectedTrainer = selectedTrainer;
    const selectedTrainerPricing = this.trainerPricing.find(trainerPricing => trainerPricing.trainer.id === selectedTrainer.id)

    if (!selectedTrainerPricing) {
      console.log('trainerPricing not found')
      return;
    }

    // You can access form controls using this.addSubscriptionForm.get('controlName').value
    const selectedMode = this.addSubscriptionForm.get('mode')?.value;
    const selectedMonths = this.addSubscriptionForm.get('months')?.value;
    const selectedCategoriesCount = this.addSubscriptionForm.get('categoryIds')?.value.length;
    console.log('selectedMode', selectedMode)
    console.log('selectedMonths', selectedMonths)
    console.log('selectedCategories', selectedCategoriesCount)

    // Get the base price based on the selected mode
    let basePrice = 0;
    switch (selectedMode) {
      case 'online':
        basePrice = selectedTrainerPricing.priceOnline;
        break;
      case 'hybrid':
        basePrice = selectedTrainerPricing.priceHybrid;
        break;
      case 'personal':
        basePrice = selectedTrainerPricing.pricePersonal;
        break;
      // Add more cases if needed
    }

    console.log('basePrice', basePrice)
    // Apply discount for selected months
    let discountedPrice = basePrice;

    switch (selectedMonths) {
      case '1':
        discountedPrice = discountedPrice + 0;
        break;
      case '3':
        discountedPrice -= ((discountedPrice * selectedTrainerPricing.discount3Months) / 100);
        discountedPrice = discountedPrice * 3;
        break;
      case '6':
        discountedPrice -= ((discountedPrice * selectedTrainerPricing.discount6Months) / 100);
        discountedPrice = discountedPrice * 6;
        break;
      case '9':
        discountedPrice -= ((discountedPrice * selectedTrainerPricing.discount9Months) / 100);
        discountedPrice = discountedPrice * 9;
        break;
      case '12':
        discountedPrice -= ((discountedPrice * selectedTrainerPricing.discount12Months) / 100);
        discountedPrice = discountedPrice * 12;
        break;
      default:
        discountedPrice = discountedPrice;
        break;
    }
    // Apply discount for 2 categories
    if (selectedCategoriesCount === 2) {
      const twoProgramsDiscount = selectedTrainerPricing.discount2Programs;
      discountedPrice -= (discountedPrice *
        twoProgramsDiscount) / 100;
    } else {
      discountedPrice = discountedPrice;
    }

    // Update a property in your component to store the total amount and bind it in your template
    this.totalAmount = discountedPrice;
    console.log('discountPrice', discountedPrice)
  }

  formatTotalAmount(amount: any) {
    return amount.toFixed(2);
  }

  onCheckboxChanged(event: any) {
    const categories = this.addSubscriptionForm.get('categoryIds') as FormArray;
    if (event.target.checked) {
      // Check the maximum number of checkboxes
      if (categories.length < 2) {
        categories.push(this.formBuilder.group({ categoryIds: event.target.value }));
      } else {
        event.target.checked = false; // Uncheck the checkbox
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


  addSubscription(): void {
    this.ngxService.start();
    if (this.addSubscriptionForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      const selectedTagIds = this.addSubscriptionForm.value.categoryIds.map((category: any) => category.categoryIds);
      const categoryIdsString = selectedTagIds.join(',');
      const formData = {
        ...this.addSubscriptionForm.value,
        categoryIds: categoryIdsString
      };
      this.subscriptionService.addSubscription(formData)
        .subscribe((response: any) => {
          this.onAddSubscriptionEmit.emit();
          this.addSubscriptionForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('Subscription added successfully');
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, "error");
        });
    }
    this.ngxService.stop();
    this.snackbarService.openSnackBar(this.responseMessage, "error");
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without adding a subscription');
  }

  clear() {
    this.addSubscriptionForm.reset();
  }


}

