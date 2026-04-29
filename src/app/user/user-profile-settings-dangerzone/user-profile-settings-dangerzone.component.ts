import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-user-profile-settings-dangerzone',
  templateUrl: './user-profile-settings-dangerzone.component.html',
  styleUrls: ['./user-profile-settings-dangerzone.component.css']
})
export class UserProfileSettingsDangerzoneComponent {
  @Output() deactivate = new EventEmitter<void>();
  @Output() updateEmail = new EventEmitter<void>();

  onDeactivate() {
    this.deactivate.emit();
  }

  onUpdateEmail() {
    this.updateEmail.emit();
  }
}
