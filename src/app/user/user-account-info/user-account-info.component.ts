import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-account-info',
  templateUrl: './user-account-info.component.html',
  styleUrls: ['./user-account-info.component.css']
})
export class UserAccountInfoComponent {
  @Input() joined!: string | null;
  @Input() status!: string;

  get statusLabel(): string {
    return this.status === 'true' ? 'active' : 'inactive';
  }

  get statusClass(): string {
    return this.status === 'true' ? 'text-green-600' : 'text-red-600';
  }
}
