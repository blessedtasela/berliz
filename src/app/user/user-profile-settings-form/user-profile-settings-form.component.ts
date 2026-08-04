import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { City, Country, State } from 'src/app/models/Location.interface';
import { Users } from 'src/app/models/users.interface';

@Component({
  selector: 'app-user-profile-settings-form',
  templateUrl: './user-profile-settings-form.component.html',
  styleUrls: ['./user-profile-settings-form.component.css']
})
export class UserProfileSettingsFormComponent {

  @Input() user!: Users;
  @Input() form!: FormGroup;
  @Input() originalValue!: any;
  @Input() countries: Country[] = [];
  @Input() states: State[] = [];
  @Input() cities: City[] = [];
  @Input() invalidForm = false;

  @Output() submitForm = new EventEmitter<void>();
  @Output() genderChange = new EventEmitter<string>();
  @Output() countryChange = new EventEmitter<any>();
  @Output() stateChange = new EventEmitter<any>();

  genders: string[] = ['Male', 'Female'];

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
      ? 'border-red-300'
      : 'border-gray-200';
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