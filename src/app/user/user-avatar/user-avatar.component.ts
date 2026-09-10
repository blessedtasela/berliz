import { Component, EventEmitter, Input, Output } from '@angular/core';
import { memoizePhotoUri } from 'src/app/shared/photo-lightbox/photo-data-uri';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.css']
})
export class UserAvatarComponent {

  @Input() photo!: string | null;
  @Output() imageSelected = new EventEmitter<any>();
  showModal = false;

  private readonly _uri = memoizePhotoUri();

  onFileChange(event: any) {
    this.imageSelected.emit(event);
  }

  get src(): string {
    return this._uri(this.photo) ?? '../../../assets/icons/user.png';
  }
}