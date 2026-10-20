import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { City, Country, State } from 'src/app/models/Location.interface';
import { Users } from 'src/app/models/users.interface';
import { GENDER_OPTIONS } from 'src/app/shared/constants/gender-options';
import { LocationFormatterService } from 'src/app/services/location-formatter.service';

@Component({
    selector: 'app-user-profile-settings-form',
    templateUrl: './user-profile-settings-form.component.html',
    styleUrls: ['./user-profile-settings-form.component.css'],
    standalone: false
})
export class UserProfileSettingsFormComponent implements OnInit {

  @Input() user!: Users;
  @Input() form!: FormGroup;
  @Input() originalValue!: any;
  @Input() countries: Country[] = [];
  @Input() states: State[] = [];
  @Input() cities: City[] = [];
  @Input() invalidForm = false;
  /** Inline save-failure message shown just above the Save button. */
  @Input() submitError: string | null = null;

  @Output() submitForm = new EventEmitter<void>();
  @Output() submitErrorDismissed = new EventEmitter<void>();
  @Output() genderChange = new EventEmitter<string>();
  @Output() countryChange = new EventEmitter<any>();
  @Output() stateChange = new EventEmitter<any>();

  genders: string[] = GENDER_OPTIONS;

  constructor(private formatter: LocationFormatterService) {}

  ngOnInit(): void {
    // As-you-type phone formatting, same pattern as LocationFormComponent (signup) --
    // this form previously left the phone field as raw digits with no region-aware
    // formatting at all, unlike the dedicated country/phone picker used at signup.
    const phoneCtrl = this.form.get('phone');
    phoneCtrl?.valueChanges.subscribe(value => {
      if (!value) return;
      const iso = this.selectedCountryIso();
      if (!iso) return;
      const formatted = this.formatter.formatPhone(value, iso);
      if (formatted !== value) phoneCtrl.setValue(formatted, { emitEvent: false });
    });
  }

  private selectedCountryIso(): string | undefined {
    const countryName = this.form.get('country')?.value;
    return this.countries.find(c => c.name === countryName)?.iso2;
  }

  //-----------------------------------
  // FORM SUBMIT
  //-----------------------------------

  onSubmitClick(): void {
    this.submitForm.emit();
  }

  //-----------------------------------
  // GENDER
  //-----------------------------------

  onGenderSelect(gender: string): void {
    this.genderChange.emit(gender);
  }

  //-----------------------------------
  // COUNTRY / STATE
  //-----------------------------------

  onCountryChange(country: any): void {
    this.countryChange.emit(country);
  }

  onStateChange(state: any): void {
    this.stateChange.emit(state);
  }

  //-----------------------------------
  // VALIDATION HELPERS
  //-----------------------------------

  showError(controlName: string): boolean {
    const control = this.form.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.invalidForm)
    );
  }

  fieldBorder(controlName: string): string {
    return this.showError(controlName)
      ? 'border-red-300 dark:border-red-800'
      : 'border-gray-200 dark:border-gray-700';
  }

  //-----------------------------------
  // CUSTOM LOCATION TAGS
  //-----------------------------------

  addCustomLocation = (name: string) => {
    return {
      id: 0,
      name
    };
  };


  hasChanges(): boolean {
    return this.form.dirty &&
      this.form.valid;
  }

}