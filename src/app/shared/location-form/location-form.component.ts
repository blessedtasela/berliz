import { Component, AfterViewInit, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { LocationService, Country } from 'src/app/services/location.service';
import { Observable, of, Subscription } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

declare const intlTelInput: any;

@Component({
  selector: 'app-location-form',
  templateUrl: './location-form.component.html',
  styleUrls: ['./location-form.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationFormComponent),
      multi: true
    }
  ]
})
export class LocationFormComponent implements AfterViewInit, OnChanges, ControlValueAccessor {
  @Input() form!: FormGroup;

  countries$!: Observable<Country[]>;
  states$!: Observable<string[]>;
  cities$!: Observable<string[]>;

  selectedCountryFlag: string | null = null;

  private countryMap = new Map<string, Country>();
  private onChange = (_: any) => {};
  private onTouched = () => {};
  private subscriptions = new Subscription();

  constructor(private locationService: LocationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['form'] && this.form) {
      this.initializeFormListeners();
    }
  }

  private initializeFormListeners(): void {
    this.countries$ = this.locationService.countries$.pipe(
      tap(list => list.forEach(c => this.countryMap.set(c.code, c)))
    );

    const countryControl = this.form.get('country');
    const stateControl = this.form.get('state');
    const cityControl = this.form.get('city');
    const phoneControl = this.form.get('phone');

    if (countryControl && stateControl && cityControl && phoneControl) {
      // Clear previous subscriptions if any
      this.subscriptions.unsubscribe();
      this.subscriptions = new Subscription();

      this.states$ = countryControl.valueChanges.pipe(
        tap(code => {
          const c = this.countryMap.get(code);

          // Update flag
          this.selectedCountryFlag = c?.flag || null;

          // Set phone with one + inside parentheses, e.g. (+123...)
          if (c?.dialCode) {
            let dial = c.dialCode;
            if (!dial.startsWith('+')) {
              dial = '+' + dial;
            }
            phoneControl.setValue(`(${dial})`);
          } else {
            phoneControl.setValue('');
          }

          this.form.patchValue({
            state: '',
            city: '',
            postalCode: ''
          }, { emitEvent: false });
        }),
        switchMap(code => {
          const name = this.countryMap.get(code)?.name;
          return name ? this.locationService.getStates(name) : of([]);
        })
      );

      this.cities$ = stateControl.valueChanges.pipe(
        tap(() => cityControl.reset('')),
        switchMap(state => {
          const countryCode = countryControl.value;
          const countryName = this.countryMap.get(countryCode)?.name;

          if (!state || !countryName) {
            return of([]);
          }

          return this.locationService.getCities(countryName, state);
        })
      );

      // Subscribe to start streams
      this.subscriptions.add(this.states$.subscribe());
      this.subscriptions.add(this.cities$.subscribe());
    }
  }

  ngAfterViewInit(): void {
    const input = document.querySelector('#phone-input') as HTMLInputElement;
    if (input) {
      intlTelInput(input, {
        initialCountry: 'auto',
        utilsScript: 'assets/utils.js'
      });
    }
  }

  writeValue(val: any): void {
    if (val && this.form) {
      this.form.patchValue(val);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    if (this.form) {
      this.form.valueChanges.subscribe(this.onChange);
    }
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (this.form) {
      isDisabled ? this.form.disable() : this.form.enable();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
