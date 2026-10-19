import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { cleanFeeKeepZero, flattenAreas, groupLocations, normPlace, placeLabel, sameCity, TrainerArea } from 'src/app/utils/trainer-location.util';
import { ApiResponse } from 'src/app/models/Api.interface';
import { providerPricingControls, providerPricingControlValues, providerPricingPayload } from '../provider-pricing-fields/provider-pricing-fields.component';
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
    styleUrls: ['./trainer-data.component.css'],
    standalone: false
})
export class TrainerDataComponent {
  @Output() emitEvent = new EventEmitter();
  updateTrainerForm!: FormGroup;
  invalidForm: boolean = false;
  categories: Categories[] = [];
  responseMessage: any;
  submitError: string | null = null;
  selectedPhoto: any;
  @Input() trainer!: Trainers | null;
  selectedCategoriesId: any;
  user!: Users | null;
  subscriptions: Subscription[] = [];
  originalValue: any;
  destroy$ = new Subject<void>();

  countries: Country[] = [];
  private countryMap = new Map<string, Country>();
  /**
   * The "Add the places you train" panel. Country and state are picked once and stay put, so adding the
   * next batch of cities in the same state is just: pick cities, press Add.
   */
  quickAdd: { country: string | null; state: string | null; cities: string[] } = { country: null, state: null, cities: [] };
  quickStates: string[] = [];
  quickCities: string[] = [];
  quickLoading: 'states' | 'cities' | null = null;
  private quickStateIds = new Map<string, number>();

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
      ...providerPricingControls(this.trainer),
      'areas': this.formBuilder.array([]),
      'customLocationAllowed': [!!this.trainer?.customLocationAllowed],
      'customLocationFee': [this.trainer?.customLocationFee ?? null, Validators.min(0)],
      // Whether (and for what) the trainer also goes to a client's own place outside every city listed.
      'customLocationOutsideAllowed': [this.trainer?.customLocationOutsideAllowed !== false],
      'customLocationOutsideFee': [this.trainer?.customLocationOutsideFee ?? null, Validators.min(0)],
    });

    groupLocations(this.trainer?.locations).forEach(area => this.addArea(area));

    this.locationService.countries$.subscribe(countries => {
      this.countries = countries;
      this.countryMap = new Map(countries.map(c => [c.name, c]));
    });

    this.originalValue = this.updateTrainerForm.getRawValue();
  }

  // ── Where the trainer works: cities, each with any number of spots ─────────────

  get areasArray(): FormArray {
    return this.updateTrainerForm.get('areas') as FormArray;
  }

  spotsArray(areaIndex: number): FormArray {
    return this.areasArray.at(areaIndex).get('spots') as FormArray;
  }

  private newSpot(spot?: Partial<TrainerArea['spots'][number]>): FormGroup {
    return this.formBuilder.group({
      venue: [spot?.venue ?? '', Validators.maxLength(200)],
      address: [spot?.address ?? '', Validators.maxLength(300)],
      precision: [spot?.precision ?? 'EXACT'],
      fee: [spot?.fee ?? null, Validators.min(0)],
    });
  }

  addArea(area: TrainerArea): void {
    this.areasArray.push(this.formBuilder.group({
      country: [area.country, Validators.required],
      stateProvince: [area.stateProvince ?? ''],
      city: [area.city, Validators.required],
      clientAllowed: [area.clientAllowed],
      clientFee: [area.clientFee, Validators.min(0)],
      spots: this.formBuilder.array((area.spots ?? []).map(spot => this.newSpot(spot))),
    }));
  }

  removeArea(index: number): void {
    this.areasArray.removeAt(index);
  }

  addSpot(areaIndex: number): void {
    this.spotsArray(areaIndex).push(this.newSpot());
  }

  removeSpot(areaIndex: number, spotIndex: number): void {
    this.spotsArray(areaIndex).removeAt(spotIndex);
  }

  areaLabel(areaIndex: number): string {
    return placeLabel(this.areasArray.at(areaIndex).value);
  }

  /** Just the city and state, for headings inside a city's card ("Where in Vancouver?"). */
  areaCity(areaIndex: number): string {
    return this.areasArray.at(areaIndex).get('city')?.value ?? '';
  }

  trackByIndex = (index: number) => index;

  get totalPlaces(): number {
    return this.areasArray.length;
  }

  /** The "client's own place" fee fields only matter once the trainer lets clients choose their own location. */
  get clientPlacesOn(): boolean {
    return !!this.updateTrainerForm.get('customLocationAllowed')?.value;
  }

  // ── The "Add the places you train" panel ─────────────────────────────────────
  // Country and state are picked once and stay put, so the next batch of cities in the same state is just:
  // pick the cities, press Add.

  get canQuickAdd(): boolean {
    return !!this.quickAdd.country && this.quickAdd.cities.length > 0;
  }

  onQuickCountryChange(): void {
    this.quickAdd.state = null;
    this.quickAdd.cities = [];
    this.quickStates = [];
    this.quickCities = [];
    this.quickStateIds = new Map();
    const countryId = this.quickAdd.country ? this.countryMap.get(this.quickAdd.country)?.id : undefined;
    if (!countryId) return;
    this.quickLoading = 'states';
    this.locationService.getStates(countryId).subscribe(states => {
      this.quickStateIds = new Map(states.map(s => [s.name, s.id]));
      this.quickStates = states.map(s => s.name);
      this.quickLoading = null;
    });
  }

  onQuickStateChange(): void {
    this.quickAdd.cities = [];
    this.quickCities = [];
    const stateId = this.quickAdd.state ? this.quickStateIds.get(this.quickAdd.state) : undefined;
    if (!stateId) return;
    this.quickLoading = 'cities';
    this.locationService.getCities(stateId).subscribe(cities => {
      this.quickCities = cities.map(c => c.name);
      this.quickLoading = null;
    });
  }

  /** Adds one city per picked name, skipping any already listed, then clears the cities but keeps the country and state. */
  addQuickCities(): void {
    if (!this.canQuickAdd) return;
    const country = this.quickAdd.country!;
    const state = (this.quickAdd.state ?? '').trim();

    let added = 0;
    for (const raw of this.quickAdd.cities) {
      const city = raw.trim();
      const place = { country, stateProvince: state, city };
      if (!city || this.areasArray.controls.some(g => sameCity(g.value, place))) continue;
      this.addArea({ ...place, clientAllowed: true, clientFee: null, spots: [] });
      added++;
    }

    const skipped = this.quickAdd.cities.length - added;
    this.quickAdd.cities = [];
    this.snackBarService.openSnackBar(
      added === 0 ? 'Those places are already on your list'
        : `Added ${added} ${added === 1 ? 'place' : 'places'}${skipped ? ` (${skipped} already listed)` : ''}`,
      added === 0 ? 'info' : '');
    this.updateTrainerForm.markAsDirty();
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
      categoryIds: (trainer.categories ?? []).map(category => category.id),
      serviceMode: trainer.serviceMode ?? 'IN_PERSON',
      ...providerPricingControlValues(trainer),
      customLocationAllowed: !!trainer.customLocationAllowed,
      customLocationFee: trainer.customLocationFee ?? null,
      customLocationOutsideAllowed: trainer.customLocationOutsideAllowed !== false,
      customLocationOutsideFee: trainer.customLocationOutsideFee ?? null,
    });

    this.areasArray.clear();
    groupLocations(trainer.locations).forEach(area => this.addArea(area));
  }

  /** Empty/zero/invalid input means "no fee" (null); otherwise the amount. */
  private toFee(value: unknown): number | null {
    const n = value === '' || value == null ? NaN : Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  validateCheckbox(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const checkboxes = formArray.value;
      const isChecked = checkboxes.length > 0;

      return isChecked ? null : { noCheckboxChecked: true };
    };
  }

  onCheckboxChanged(event: any) {
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
    this.submitError = null;
    if (this.updateTrainerForm.invalid) {
      this.invalidForm = true;
      this.updateTrainerForm.markAllAsTouched();
      this.responseMessage = "Invalid form. Please complete all sections";
      // The form shows an inline "complete all required fields" notice while invalidForm is set.
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
      locations: flattenAreas(formValue.areas),
      ...providerPricingPayload(formValue),
      customLocationAllowed: !!formValue.customLocationAllowed,
      // The backend treats a null fee as "leave untouched", so a cleared field is sent as 0 (= no surcharge).
      customLocationFee: this.toFee(formValue.customLocationFee) ?? 0,
      // Sent together: the flag saves both, and a blank fee here means "same as the fee above" (0 means free).
      customLocationOutsideAllowed: formValue.customLocationOutsideAllowed !== false,
      customLocationOutsideFee: cleanFeeKeepZero(formValue.customLocationOutsideFee),
    };

    this.ngxService.start();
    this.trainerService.updateTrainer(payload).subscribe({
      next: (response: ApiResponse<Trainers>) => {
        // The loader is stopped in `finally`: anything below throwing used to leave it spinning forever.
        try {
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage || 'Your trainer profile has been updated', "");
          // The saved trainer is `response.data` -- the endpoint answers with an ApiResponse wrapper.
          const saved = response?.data;
          if (saved) {
            this.updateFormValues(saved);
            this.trainer = saved;
          }
          this.originalValue = this.updateTrainerForm.getRawValue();
          this.emitEvent.emit();
        } finally {
          this.ngxService.stop();
        }
      },

      error: (error: any) => {
        this.responseMessage = error.error?.message || genericError;
        this.submitError = this.responseMessage;
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

