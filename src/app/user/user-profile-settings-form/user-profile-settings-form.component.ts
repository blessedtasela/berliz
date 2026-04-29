import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Users } from 'src/app/models/users.interface';


@Component({
  selector: 'app-user-profile-settings-form',
  templateUrl: './user-profile-settings-form.component.html',
  styleUrls: ['./user-profile-settings-form.component.css']
})
export class UserProfileSettingsFormComponent {

 @Input() user!: Users;
  @Input() form!: FormGroup;
  @Input() countries: any[] = [];
  @Input() invalidForm = false;

  @Output() submitForm = new EventEmitter<void>();
  @Output() genderChange = new EventEmitter<string>();

  onSubmitClick() {
    this.submitForm.emit();
  }

  onGenderSelect(value: string) {
    this.genderChange.emit(value);
  }
}