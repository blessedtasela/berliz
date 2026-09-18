import { Component, EventEmitter, Input, Output } from '@angular/core';
import { memoizePhotoUri } from 'src/app/shared/photo-lightbox/photo-data-uri';
import { SnackBarService } from 'src/app/services/snack-bar.service';

const MAX_AVATAR_MB = 5;

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

  constructor(private snackbar: SnackBarService) { }

  onFileChange(event: any) {
    const file = event?.target?.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.snackbar.openSnackBar('Please choose an image file.', 'error');
        event.target.value = '';
        return;
      }
      if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
        this.snackbar.openSnackBar(`Image is too large (max ${MAX_AVATAR_MB}MB).`, 'error');
        event.target.value = '';
        return;
      }
    }
    this.imageSelected.emit(event);
  }

  get src(): string {
    return this._uri(this.photo) ?? '../../../assets/icons/user.png';
  }
}