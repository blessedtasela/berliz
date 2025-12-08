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

  phoneMask = '000000000000000'; // max 15 digits
  selectedDialCode: string = '';
  selectedCountryFlag: string | null = null;
  phoneDialError: string = '';

  private defaultPlaceholders: Record<string, string> = {
    country: 'Select Country',
    state: 'Select State / Province',
    city: 'Select City',
    address: 'Enter Address',
    postalCode: 'Enter Postal Code',
    phone: 'xxx-xxx-xxxx',
    dial: '+123...',
  };

  countryPlaceholder = this.defaultPlaceholders['country'];
  statePlaceholder = this.defaultPlaceholders['state'];
  cityPlaceholder = this.defaultPlaceholders['city'];
  addressPlaceholder = this.defaultPlaceholders['address'];
  postalPlaceholder = this.defaultPlaceholders['postalCode'];
  phonePlaceholder = this.defaultPlaceholders['phone'];
  dialPlaceholder = this.defaultPlaceholders['dial'];

  private countryMap = new Map<string, Country>();
  private subscriptions = new Subscription();
  private onChange = (_: any) => {};
  private onTouched = () => {};

  constructor(private locationService: LocationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['form'] && this.form) this.initializeFormListeners();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Focus/Blur
  onItemFocus(controlName: string): void {
    const control = this.form.get(controlName);
    if (control && !control.value)
      (this as any)[`${controlName}Placeholder`] = 'Start typing...';
  }

  onItemBlur(controlName: string): void {
    const control = this.form.get(controlName);
    (this as any)[`${controlName}Placeholder`] =
      control && control.value
        ? ''
        : this.defaultPlaceholders[controlName];
  }

  searchCountry(term: string, item: Country): boolean {
    term = term.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.code.toLowerCase().includes(term) ||
      item.dialCode.toLowerCase().includes(term)
    );
  }

  onDialSelect(selectedDial: string): void {
    const matched = this.countries.find(c => c.dialCode === selectedDial);
    if (matched) {
      this.selectedCountryFlag = matched.flag;
      this.dialPlaceholder = '';
      this.phoneDialError = '';
      this.form.get('country')?.setValue(matched.code, { emitEvent: true });
    }
  }

  private updatePlaceholder(controlName: string, value: any) {
    (this as any)[`${controlName}Placeholder`] = value
      ? ''
      : this.defaultPlaceholders[controlName];
  }

  private initializeFormListeners(): void {
    const countryControl = this.form.get('country');
    const stateControl = this.form.get('state');
    const cityControl = this.form.get('city');
    const addressControl = this.form.get('address');
    const postalControl = this.form.get('postalCode');
    const phoneControl = this.form.get('phone');

    if (!countryControl || !stateControl || !cityControl || !addressControl || !postalControl || !phoneControl) return;

    phoneControl.setValidators([Validators.required, Validators.pattern(/^\d{8,15}$/)]);

    // Load countries
    this.subscriptions.add(
      this.locationService.countries$.pipe(
        tap(countries => {
          this.countries = countries;
          countries.forEach(c => this.countryMap.set(c.code, c));
        })
      ).subscribe()
    );

    // Country changes
    this.subscriptions.add(
      countryControl.valueChanges.subscribe(code => {
        this.updatePlaceholder('country', code);
        const country = this.countryMap.get(code);

        if (country) {
          this.selectedDialCode = country.dialCode.startsWith('+') ? country.dialCode : `+${country.dialCode}`;
          this.dialPlaceholder = '';
          this.selectedCountryFlag = country.flag || null;
          this.phoneDialError = '';

          this.form.patchValue({ state: '', city: '', postalCode: '', phone: '' }, { emitEvent: false });
          this.states = [];
          this.cities = [];
          ['state', 'city', 'postalCode', 'phone'].forEach(n => this.updatePlaceholder(n, ''));
        } else {
          this.selectedDialCode = '';
          this.dialPlaceholder = this.defaultPlaceholders['dial'];
          this.selectedCountryFlag = null;
        }
      })
    );

    // Phone input changes
    this.subscriptions.add(
      phoneControl.valueChanges.subscribe(value => {
        this.updatePlaceholder('phone', value);
        if (value && value.startsWith('+')) {
          const match = value.match(/^\+\d{1,4}/);
          const dial = match ? match[0] : '';
          if (dial) {
            const matched = this.countries.find(c => c.dialCode === dial);
            if (matched) {
              this.selectedDialCode = matched.dialCode;
              this.selectedCountryFlag = matched.flag;
              this.dialPlaceholder = '';
              this.phoneDialError = '';
              this.form.get('country')?.setValue(matched.code, { emitEvent: true });
            } else {
              this.phoneDialError = 'Unknown country code — please select a valid dial.';
              this.selectedDialCode = '';
              this.selectedCountryFlag = null;
            }
          }
        }
      })
    );

    // State changes
    this.subscriptions.add(
      stateControl.valueChanges.subscribe(state => {
        this.updatePlaceholder('state', state);
        cityControl.setValue('');
        this.updatePlaceholder('city', '');
        this.cities = [];
      })
    );

    // Address / Postal / City placeholders
    this.subscriptions.add(addressControl.valueChanges.subscribe(v => this.updatePlaceholder('address', v)));
    this.subscriptions.add(postalControl.valueChanges.subscribe(v => this.updatePlaceholder('postalCode', v)));
    this.subscriptions.add(cityControl.valueChanges.subscribe(v => this.updatePlaceholder('city', v)));

    // Load states
    this.subscriptions.add(
      countryControl.valueChanges.pipe(
        switchMap(code => {
          const name = this.countryMap.get(code)?.name;
          return name ? this.locationService.getStates(name) : of([]);
        })
      ).subscribe(states => (this.states = states))
    );

    // Load cities
    this.subscriptions.add(
      stateControl.valueChanges.pipe(
        switchMap(state => {
          const code = countryControl.value;
          const name = this.countryMap.get(code)?.name;
          return state && name ? this.locationService.getCities(name, state) : of([]);
        })
      ).subscribe(cities => (this.cities = cities))
    );
  }

  // ControlValueAccessor
  writeValue(val: any): void { if (val && this.form) this.form.patchValue(val); }
  registerOnChange(fn: any): void {
    this.onChange = fn;
    if (this.form) this.subscriptions.add(this.form.valueChanges.subscribe(this.onChange));
  }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void { isDisabled ? this.form.disable() : this.form.enable(); }
}
