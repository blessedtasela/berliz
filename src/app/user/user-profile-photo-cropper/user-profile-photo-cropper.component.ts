import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-user-profile-photo-cropper',
  templateUrl: './user-profile-photo-cropper.component.html',
  styleUrls: ['./user-profile-photo-cropper.component.css']
})
export class UserProfilePhotoCropperComponent {

 @Input() imageChangedEvent: any;
  @Output() cropped = new EventEmitter<Blob>();
  @Output() upload = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  croppedImage: Blob | null = null;

  imageCropped(event: ImageCroppedEvent) {
    if (event.blob) {
      this.croppedImage = event.blob;
      this.cropped.emit(event.blob);
    }
  }

  onUploadClick() {
    if (this.croppedImage) {
      this.upload.emit();
    }
  }

  onCancelClick() {
    this.cancel.emit();
  }
}