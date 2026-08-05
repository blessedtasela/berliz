import { Component, Input } from '@angular/core';
import { PhotoResponse } from 'src/app/models/Media.interface';
import { TrainerPhotoAlbum } from 'src/app/models/trainers.interface';
import { environment } from 'src/environments/environment';

/**
 * Public read-only rendering of a trainer's photo album.
 * `TrainerPhotoAlbum.photos` is a `PhotoResponse[]`.
 */
@Component({
  selector: 'app-trainer-album',
  templateUrl: './trainer-album.component.html',
  styleUrls: ['./trainer-album.component.css']
})
export class TrainerAlbumComponent {

  @Input() trainerPhotoAlbum: TrainerPhotoAlbum | null = null;

  readonly strapiUrl = environment.strapiUrl;

  lightboxUrl = '';

  get photos(): PhotoResponse[] {
    return this.trainerPhotoAlbum?.photos ?? [];
  }

  photoUrl(photo: PhotoResponse): string {
    const url = photo?.photoUrl;
    if (!url) return 'assets/avatar.png';
    return url.startsWith('http') ? url : `${this.strapiUrl}${url}`;
  }

  open(photo: PhotoResponse): void {
    this.lightboxUrl = this.photoUrl(photo);
  }

  close(): void {
    this.lightboxUrl = '';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }
}
