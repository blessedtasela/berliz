import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Subscription, of } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { LocationService, Country } from 'src/app/services/location.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { LocationFormatterService } from 'src/app/services/location-formatter.service';

@Component({
  selector: 'app-location-form',
  templateUrl: './location-form.component.html',
  styleUrls: ['./location-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationFormComponent),
      multi: true
    }
  ]
})
export class LocationFormComponent implements OnInit, OnDestroy, ControlValueAccessor {

  @Input() form!: FormGroup;

  countries: Country[] = [];
  states: string[] = [];
  cities: string[] = [];

  examplePhone = '';

  private subscriptions = new Subscription();
  private countryMap = new Map<string, Country>();

  private onChange = (_: any) => { };
  private onTouched = () => { };

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private snackBar: SnackBarService,
    private formatter: LocationFormatterService
  ) { }

  ngOnInit(): void {
    if (!this.form) {
      this.form = this.fb.group({
        country: [null, Validators.required],
        state: [{ value: null, disabled: true }, Validators.required],
        city: [{ value: null, disabled: true }, Validators.required],
        postalCode: ['', Validators.required],
        address: ['', Validators.required],
        countryCode: ['', Validators.required],
        phone: ['', Validators.required]
      });
    }

    this.form.get('state')?.disable({ emitEvent: false });
    this.form.get('city')?.disable({ emitEvent: false });

    this.initializeForm();
    this.setupPhoneFormatting();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /** ================== FORM LOGIC ================== */
  private initializeForm(): void {
    const countryCtrl = this.form.get('country')!;
    const stateCtrl = this.form.get('state')!;
    const cityCtrl = this.form.get('city')!;

    // Load countries
    this.subscriptions.add(
      this.locationService.countries$
        .pipe(
          tap(countries => {
            this.countries = countries;
            countries.forEach(c => this.countryMap.set(c.code, c));
          })
        )
        .subscribe()
    );

    // Country change → enable state
    this.subscriptions.add(
      countryCtrl.valueChanges.subscribe(code => {
        stateCtrl.reset();
        cityCtrl.reset();
        this.states = [];
        this.cities = [];
        if (code) stateCtrl.enable({ emitEvent: false });
        else {
          stateCtrl.disable({ emitEvent: false });
          cityCtrl.disable({ emitEvent: false });
        }
      })
    );

    // Load states based on country
    this.subscriptions.add(
      countryCtrl.valueChanges
        .pipe(
          switchMap(code => {
            const countryName = this.countryMap.get(code)?.name;
            return countryName ? this.locationService.getStates(countryName) : of([]);
          })
        )
        .subscribe(states => this.states = states)
    );

    // State → city enable
    this.subscriptions.add(
      stateCtrl.valueChanges.subscribe(state => {
        cityCtrl.reset();
        this.cities = [];
        if (state) cityCtrl.enable({ emitEvent: false });
        else cityCtrl.disable({ emitEvent: false });
      })
    );

    // Load cities based on state
    this.subscriptions.add(
      stateCtrl.valueChanges
        .pipe(
          switchMap(state => {
            const countryName = this.countryMap.get(countryCtrl.value)?.name;
            return state && countryName ? this.locationService.getCities(countryName, state) : of([]);
          })
        )
        .subscribe(cities => this.cities = cities)
    );
  }

  /** ================== PHONE FORMATTING ================== */
  private setupPhoneFormatting(): void {
    const phoneCtrl = this.form.get('phone')!;
    const codeCtrl = this.form.get('countryCode')!;

    // Reset phone & example when country code changes
    this.subscriptions.add(
      codeCtrl.valueChanges.subscribe(code => {
        phoneCtrl.setValue('', { emitEvent: false });
        this.examplePhone = code ? this.formatter.getExamplePhone(code) : '';
      })
    );

    // Live formatting
    this.subscriptions.add(
      phoneCtrl.valueChanges.subscribe(value => {
        const code = codeCtrl.value;
        if (value && code) {
          const formatted = this.formatter.formatPhone(value, code);
          if (formatted !== value) phoneCtrl.setValue(formatted, { emitEvent: false });
        }
      })
    );
  }

  /** ================== ADD NEW ITEM FUNCTIONS ================== */
  addState = (name: string) => { if (!this.states.includes(name)) this.states.push(name); return name; }
  addCity = (name: string) => { if (!this.cities.includes(name)) this.cities.push(name); return name; }

  /** ================== UX FEEDBACK ================== */
  onStateClick(): void {
    if (this.form.get('state')?.disabled) this.snackBar.openSnackBar('Please select a country first', 'info');
  }
  onCityClick(): void {
    if (this.form.get('city')?.disabled) this.snackBar.openSnackBar('Please select a state/province first', 'info');
  }

  /** ================== CVA ================== */
  writeValue(val: any): void { if (val) this.form.patchValue(val, { emitEvent: false }); }
  registerOnChange(fn: any): void { this.onChange = fn; this.subscriptions.add(this.form.valueChanges.subscribe(this.onChange)); }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { isDisabled ? this.form.disable() : this.form.enable(); }

  /** ================== VALIDATORS ================== */
  isAddressValid(): boolean {
    const val = this.form.get('address')?.value;
    return this.formatter.validateAddress(val);
  }

  isPostalCodeValid(): boolean {
    const val = this.form.get('postalCode')?.value;
    const countryCode = this.form.get('country')?.value;
    return this.formatter.validatePostalCode(val, countryCode || '');
  }

  isPhoneValid(): boolean {
    const phone = this.form.get('phone')?.value;
    const code = this.form.get('countryCode')?.value;
    return this.formatter.validatePhone(phone, code);
  }
}
