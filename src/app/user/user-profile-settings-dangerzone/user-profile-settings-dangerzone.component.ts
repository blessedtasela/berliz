import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-user-profile-settings-dangerzone',
    templateUrl: './user-profile-settings-dangerzone.component.html',
    styleUrls: ['./user-profile-settings-dangerzone.component.css'],
    standalone: false
})
export class UserProfileSettingsDangerzoneComponent {
  @Output() deactivate = new EventEmitter<void>();
  @Output() updateEmail = new EventEmitter<void>();
  /** Permanently delete the account -- distinct from `deactivate`, which only stops sign-in. */
  @Output() deleteAccount = new EventEmitter<void>();

  onDeactivate() {
    this.deactivate.emit();
  }

  onDeleteAccount() {
    this.deleteAccount.emit();
  }

  onUpdateEmail() {
    this.updateEmail.emit();
  }
}
