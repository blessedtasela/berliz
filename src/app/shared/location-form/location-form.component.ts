import {
  Component,
  AfterViewInit,
  forwardRef,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy
} from '@angular/core';
import {
  FormGroup,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  Validators,
  FormBuilder
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
export class LocationFormComponent
  implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {

  @Input() form!: FormGroup;

  countries: Country[] = [];
  states: string[] = [];
  cities: string[] = [];

  selectedDialCode: string = '';
  selectedCountryFlag: string | null = null;

  private subscriptions = new Subscription();
  private countryMap = new Map<string, Country>();

  private onChange = (_: any) => { };
  private onTouched = () => { };

  /** PHONE FORMAT RULES */
  private phoneFormats: Record<
    string,
    { max: number; format: (v: string) => string }
  > = {
    '+1': {
      max: 10,
      format: v =>
        v.length <= 3
          ? v
          : v.length <= 6
            ? `(${v.slice(0, 3)}) ${v.slice(3)}`
            : `(${v.slice(0, 3)}) ${v.slice(3, 6)} ${v.slice(6)}`
    },
    '+234': {
      max: 11,
      format: v =>
        v.length <= 4
          ? v
          : v.length <= 7
            ? `${v.slice(0, 4)} ${v.slice(4)}`
            : `${v.slice(0, 4)} ${v.slice(4, 7)} ${v.slice(7)}`
    }
  };

  constructor(private locationService: LocationService, private fb: FormBuilder) {
    // Initialize form with null for selects to show placeholder correctly
    this.form = this.fb.group({
      country: [null, Validators.required],
      state: [null],
      city: [null],
      address: [''],
      postalCode: [''],
      phone: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['form'] && this.form) {
      this.initializeFormListeners();
    }
  }

  ngAfterViewInit(): void { }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /* ===================== SEARCH FUNCTIONS ===================== */
  searchCountryByName(term: string, item: Country): boolean {
    return item.name.toLowerCase().includes(term.toLowerCase());
  }

  searchDialCodeOnly(term: string, item: Country): boolean {
    return item.dialCode.replace('+', '').includes(term.replace(/\D/g, ''));
  }

  /* ===================== PHONE INPUT ===================== */
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let raw = input.value.replace(/\D/g, '');

    const cfg = this.phoneFormats[this.selectedDialCode];

    if (cfg) {
      raw = raw.slice(0, cfg.max);
      input.value = cfg.format(raw);
    } else {
      raw = raw.slice(0, 15);
      input.value = raw;
    }

    this.form.get('phone')?.setValue(raw, { emitEvent: false });
  }

  private reformatPhone(): void {
    const phoneCtrl = this.form.get('phone');
    if (!phoneCtrl) return;

    const raw = phoneCtrl.value?.replace(/\D/g, '');
    if (!raw) return;

    const cfg = this.phoneFormats[this.selectedDialCode];
    if (cfg) {
      phoneCtrl.setValue(raw, { emitEvent: false });
    }
  }

  /* ===================== INITIALIZE FORM LISTENERS ===================== */
  private initializeFormListeners(): void {
    const countryCtrl = this.form.get('country');
    const stateCtrl = this.form.get('state');
    const cityCtrl = this.form.get('city');
    const phoneCtrl = this.form.get('phone');

    if (!countryCtrl || !stateCtrl || !cityCtrl || !phoneCtrl) return;

    phoneCtrl.setValidators([
      Validators.required,
      Validators.pattern(/^\d{8,15}$/)
    ]);

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

    // When country changes → reset state and city
    this.subscriptions.add(
      countryCtrl.valueChanges.subscribe(code => {
        const country = this.countryMap.get(code);

        // reset children
        stateCtrl.setValue(null, { emitEvent: false });
        cityCtrl.setValue(null, { emitEvent: false });
        this.states = [];
        this.cities = [];

        if (country) {
          this.selectedCountryFlag = country.flag || null;

          // load states for selected country
          this.locationService.getStates(country.name).subscribe(states => {
            this.states = states;
            stateCtrl.setValue(null, { emitEvent: false }); // ensure placeholder shows
          });
        }
      })
    );

    // When state changes → reset city
    this.subscriptions.add(
      stateCtrl.valueChanges.subscribe(state => {
        cityCtrl.setValue(null, { emitEvent: false });
        this.cities = [];

        const countryName = this.countryMap.get(countryCtrl.value)?.name;
        if (state && countryName) {
          this.locationService.getCities(countryName, state).subscribe(cities => {
            this.cities = cities;
            cityCtrl.setValue(null, { emitEvent: false }); // ensure placeholder shows
          });
        }
      })
    );

    // Reformat phone
    this.subscriptions.add(
      this.form.valueChanges.subscribe(() => {
        this.reformatPhone();
      })
    );
  }

  /* ===================== CVA ===================== */
  writeValue(val: any): void {
    if (val && this.form) {
      this.form.patchValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.subscriptions.add(
      this.form.valueChanges.subscribe(this.onChange)
    );
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.form.disable() : this.form.enable();
  }
}
