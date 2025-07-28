import {
  Component, AfterViewInit, forwardRef, Input, OnChanges, SimpleChanges, OnDestroy
} from '@angular/core';
import {
  FormGroup, NG_VALUE_ACCESSOR, ControlValueAccessor, Validators
} from '@angular/forms';
import { LocationService, Country } from 'src/app/services/location.service';
import { Subscription, of } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

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
export class LocationFormComponent implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
  @Input() form!: FormGroup;

  countries: Country[] = [];
  states: string[] = [];
  cities: string[] = [];

  countryPlaceholder = 'Select Country';
  selectedDialCode: string = '';
  selectedCountryFlag: string | null = null;
  dialCode: string = '';
  phoneMask: string = '00000000';

  private countryMap = new Map<string, Country>();
  private subscriptions = new Subscription();
  private onChange = (_: any) => { };
  private onTouched = () => { };

  constructor(private locationService: LocationService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['form'] && this.form) {
      this.initializeFormListeners();
    }
  }


  resetCountryPlaceholder() {
    this.countryPlaceholder = 'Select Country';
  }

 onItemFocus() {
  const hasValue = this.form.get('country')?.value;

  if (!hasValue) {
    this.countryPlaceholder = 'Start typing...';
  } else {
    this.countryPlaceholder = ''; // Hide placeholder if value already selected
  }
}

  onCountryBlur(): void {
    if (!this.form.get('country')?.value) {
      this.countryPlaceholder = 'Select Country';
    }
  }

  private initializeFormListeners(): void {
    const countryControl = this.form.get('country');
    const stateControl = this.form.get('state');
    const cityControl = this.form.get('city');
    const phoneControl = this.form.get('phone');

    if (!countryControl || !stateControl || !cityControl || !phoneControl) return;

    // Phone validation
    phoneControl.setValidators([
      Validators.required,
      Validators.pattern(/^\d{8,15}$/)
    ]);

    // Load and map countries
    this.subscriptions.add(
      this.locationService.countries$.pipe(
        tap(countries => {
          this.countries = countries;
          countries.forEach(c => this.countryMap.set(c.code, c));
        })
      ).subscribe()
    );

    // React to country change
    this.subscriptions.add(
      countryControl.valueChanges.pipe(
        tap(code => {
          const country = this.countryMap.get(code);
          this.selectedCountryFlag = country?.flag || null;
          this.dialCode = country?.dialCode?.startsWith('+') ? country.dialCode : `+${country?.dialCode || ''}`;
          this.setPhoneMask(code);
          phoneControl.reset();
          this.form.patchValue({ state: '', city: '', postalCode: '' }, { emitEvent: false });
        }),
        switchMap(code => {
          const countryName = this.countryMap.get(code)?.name;
          return countryName ? this.locationService.getStates(countryName) : of([]);
        })
      ).subscribe(states => this.states = states)
    );

    // React to state change
    this.subscriptions.add(
      stateControl.valueChanges.pipe(
        tap(() => cityControl.reset('')),
        switchMap(state => {
          const countryCode = countryControl.value;
          const countryName = this.countryMap.get(countryCode)?.name;
          return (state && countryName) ? this.locationService.getCities(countryName, state) : of([]);
        })
      ).subscribe(cities => this.cities = cities)
    );
  }

  private setPhoneMask(countryCode: string): void {
    const dialLength = this.dialCode.replace('+', '').length;
    const total = 15 - dialLength;
    const safe = Math.max(8, Math.min(15, total));
    this.phoneMask = countryCode.padEnd(safe, '0');
  }


  onCountryChange(selectedCode: string | null) {
  if (!selectedCode) {
    // Cleared selection
    this.selectedCountryFlag = null;
    this.countryPlaceholder = 'Select Country';
    this.form.get('phone')?.setValue('');
    this.selectedDialCode = '';
    return;
  }

  const selected = this.countries.find(c => c.code === selectedCode);

  if (selected) {
    this.selectedCountryFlag = selected.flag;
    this.selectedDialCode = selected.dialCode;

    // Insert dial code if not already there
    const currentPhone = this.form.get('phone')?.value || '';
    if (!currentPhone.startsWith(selected.dialCode)) {
      this.form.get('phone')?.setValue(`${selected.dialCode} `);
    }

    this.countryPlaceholder = ''; // Hide placeholder when selected
  } else {
    this.selectedCountryFlag = null;
    this.selectedDialCode = '';
    this.countryPlaceholder = '';
  }
}

  ngAfterViewInit(): void { }

  writeValue(val: any): void {
    if (val && this.form) {
      this.form.patchValue(val);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    if (this.form) {
      this.subscriptions.add(this.form.valueChanges.subscribe(this.onChange));
    }
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.form.disable() : this.form.enable();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getFullPhoneNumber(): string {
    const phone = this.form.get('phone')?.value || '';
    const dial = this.dialCode.replace(/\s/g, '');
    return `${dial}${phone}`;
  }
}
