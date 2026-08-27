import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { Trainers, TrainerLocation } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { LocationService } from 'src/app/services/location.service';
import { Country } from 'src/app/models/Location.interface';
import { selectCurrentTrainer } from 'src/app/state/trainer/trainer.selector';
import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { genericError } from 'src/validators/form-validators.module';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';

@Component({
  selector: 'app-trainer-data',
  templateUrl: './trainer-data.component.html',
  styleUrls: ['./trainer-data.component.css']
})
export class TrainerDataComponent {
  @Output() emitEvent = new EventEmitter();
  updateTrainerForm!: FormGroup;
  invalidForm: boolean = false;
  categories: Categories[] = [];
  responseMessage: any;
  selectedPhoto: any;
  @Input() trainer!: Trainers | null;
  selectedCategoriesId: any;
  user!: Users | null;
  subscriptions: Subscription[] = [];
  originalValue: any;
  destroy$ = new Subject<void>();

  countries: Country[] = [];
  /** Available states/cities per location row, indexed the same as the `locations` FormArray. */
  locationStates: string[][] = [];
  locationCities: string[][] = [];

  constructor(private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private store: Store,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private trainerService: TrainerService,
    private locationService: LocationService,
    private datePipe: DatePipe,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.handleEmitEvent();
    this.selectedCategoriesId = this.trainer?.categories?.map(category => category.id) ?? [];
    this.updateTrainerForm = this.formBuilder.group({
      'id': this.trainer?.id ?? null,
      'name': [this.trainer?.name ?? '', Validators.compose([Validators.required, Validators.minLength(3)])],
      'motto': [this.trainer?.motto ?? '', Validators.compose([Validators.required, Validators.minLength(10)])],
      'experience': [this.trainer?.experience ?? '', Validators.compose([Validators.required, Validators.minLength(1)])],
      'likes': [this.trainer?.likes ?? '', Validators.compose([Validators.required, Validators.minLength(1)])],
      'categoryIds': this.formBuilder.array(this.selectedCategoriesId, this.validateCheckbox()),
      'serviceMode': [this.trainer?.serviceMode ?? 'IN_PERSON'],
      'locations': this.formBuilder.array([]),
    });

    (this.trainer?.locations ?? []).forEach(loc => this.addLocation(loc));

    this.locationService.countries$.subscribe(countries => this.countries = countries);

    this.originalValue = this.updateTrainerForm.getRawValue();
  }

  get locationsArray(): FormArray {
    return this.updateTrainerForm.get('locations') as FormArray;
  }

  addLocation(existing?: TrainerLocation): void {
    this.locationsArray.push(this.formBuilder.group({
      country: [existing?.country ?? '', Validators.required],
      stateProvince: [existing?.stateProvince ?? ''],
      city: [existing?.city ?? '', Validators.required],
    }));
    this.locationStates.push([]);
    this.locationCities.push([]);

    if (existing?.country) {
      const i = this.locationsArray.length - 1;
      this.locationService.getStates(existing.country).subscribe(states => this.locationStates[i] = states);
      if (existing.stateProvince) {
        this.locationService.getCities(existing.country, existing.stateProvince)
          .subscribe(cities => this.locationCities[i] = cities);
      }
    }
  }

  removeLocation(index: number): void {
    this.locationsArray.removeAt(index);
    this.locationStates.splice(index, 1);
    this.locationCities.splice(index, 1);
  }

  onLocationCountryChange(index: number): void {
    const group = this.locationsArray.at(index);
    const country = group.get('country')?.value;
    group.get('stateProvince')?.setValue('');
    group.get('city')?.setValue('');
    this.locationCities[index] = [];
    this.locationStates[index] = [];
    if (country) {
      this.locationService.getStates(country).subscribe(states => this.locationStates[index] = states);
    }
  }

  onLocationStateChange(index: number): void {
    const group = this.locationsArray.at(index);
    const country = group.get('country')?.value;
    const state = group.get('stateProvince')?.value;
    group.get('city')?.setValue('');
    this.locationCities[index] = [];
    if (country && state) {
      this.locationService.getCities(country, state).subscribe(cities => this.locationCities[index] = cities);
    }
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

 handleEmitEvent() {
  // 1. Load categories
  this.store.dispatch(loadActiveCategories());
  const catSub = this.store.select(selectActiveCategories)
    .pipe(takeUntil(this.destroy$))
    .subscribe(activeCategories => {
      this.categories = activeCategories;
    });

  // 2. Load user from store
  this.store.dispatch(loadUser());

  const userSub = this.store.select(selectUser)
    .pipe(takeUntil(this.destroy$))
    .subscribe(user => {
      this.user = user;
    });

  // 3. Load trainer from store
  // this.store.dispatch(loadTrainer());

  // const trainerSub = this.store.select(selectCurrentTrainer)
  //   .pipe(takeUntil(this.destroy$))
  //   .subscribe(trainer => {
  //     this.trainer = trainer;
  //   });

  // 4. Track subscriptions (only the ones that need manual cleanup)
  this.subscriptions.push(catSub, userSub,);
}


  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  updateFormValues(trainer: Trainers) {
    this.updateTrainerForm.patchValue({
      id: trainer.id,
      name: trainer.name,
      motto: trainer.motto,
      likes: trainer.likes,
      experience: trainer.experience,
      categoryIds: trainer.categories.map(category => category.id),
      serviceMode: trainer.serviceMode ?? 'IN_PERSON',
    });

    while (this.locationsArray.length) this.removeLocation(0);
    (trainer.locations ?? []).forEach(loc => this.addLocation(loc));
  }

  validateCheckbox(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const checkboxes = formArray.value;
      const isChecked = checkboxes.length > 0;

      return isChecked ? null : { noCheckboxChecked: true };
    };
  }

  onCheckboxChanged(event: any) {
    console.log('Checkbox changed:', event.target.checked, event.target.value);
    const categories = this.updateTrainerForm.get('categoryIds') as FormArray;

    if (event.target.checked) {
      categories.push(new FormControl(event.target.value));
    } else {
      // Remove the control by its value
      const index = categories.controls.findIndex((control) => control.value === event.target.value);
      categories.removeAt(index);
    }
  }

  updateTrainer(): void {
    if (this.updateTrainerForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      return;
    }

    this.invalidForm = false;

    const formValue = this.updateTrainerForm.value;

    const payload = {
      id: this.trainer?.id,
      partnerId: this.trainer?.partnerId,
      name: formValue.name,
      motto: formValue.motto,
      experience: formValue.experience,
      status: formValue.status,
      categoryIds: formValue.categoryIds,
      photoRequest: this.trainer?.photoResponse,
      serviceMode: formValue.serviceMode,
      locations: formValue.locations,
    };

    this.ngxService.start();
    this.trainerService.updateTrainer(payload).subscribe({
      next: (response: any) => {
        this.responseMessage = response?.message;
        this.snackBarService.openSnackBar(this.responseMessage, "");
        this.updateFormValues(response);
        this.originalValue = this.updateTrainerForm.getRawValue();
        this.trainer = response;
        this.emitEvent.emit();
        this.ngxService.stop();
      },

      error: (error: any) => {
        this.responseMessage = error.error?.message || genericError;
        this.snackBarService.openSnackBar(this.responseMessage, "error");
        this.ngxService.stop();
      }
    });
  }


  clear() {
    this.updateTrainerForm.reset();
  }

  hasChanges(): boolean {

    const current =
      JSON.stringify(
        this.updateTrainerForm.getRawValue()
      );

    const original =
      JSON.stringify(this.originalValue);

    return current !== original;
  }
}

