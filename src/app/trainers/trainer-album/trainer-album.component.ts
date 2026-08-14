import { Component, Input } from '@angular/core';
import { PhotoResponse } from 'src/app/models/Media.interface';
import { TrainerPhotoAlbum } from 'src/app/models/trainers.interface';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';

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

  lightboxUrl = '';

  get photos(): PhotoResponse[] {
    return this.trainerPhotoAlbum?.photos ?? [];
  }

  photoUrl(photo: PhotoResponse): string {
    const url = photo?.photoUrl;
    return url ? resolveStrapiUrl(url) : 'assets/avatar.png';
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
