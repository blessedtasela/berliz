import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-profile-identity',
  templateUrl: './user-profile-identity.component.html',
  styleUrls: ['./user-profile-identity.component.css']
})
export class UserProfileIdentityComponent {

  @Input() firstname!: string;
  @Input() lastname!: string;
  @Input() role!: string;
}