import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.css']
})
export class UserAvatarComponent {

  @Input() photo!: string | null;
  @Output() imageSelected = new EventEmitter<any>();

  onFileChange(event: any) {
    this.imageSelected.emit(event);
  }

  get src(): string {
    return this.photo
      ? 'data:image/*;base64,' + this.photo
      : '../../../assets/icons/user.png';
  }
}