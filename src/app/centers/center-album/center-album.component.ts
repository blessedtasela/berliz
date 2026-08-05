import { Component, Input, OnChanges } from '@angular/core';
import { CenterPhotoAlbum } from 'src/app/models/centers.interface';
import { PhotoResponse } from 'src/app/models/Media.interface';

@Component({
  selector: 'app-center-album',
  templateUrl: './center-album.component.html',
  styleUrls: ['./center-album.component.css']
})
export class CenterAlbumComponent implements OnChanges {
  /** Every photo album registered by this center. */
  @Input() centerAlbums: CenterPhotoAlbum[] = [];

  /** Flattened photo wall built from all of the center's albums. */
  photos: PhotoResponse[] = [];
  showAllPhotos: boolean = false;

  ngOnChanges(): void {
    this.photos = (this.centerAlbums ?? []).reduce<PhotoResponse[]>(
      (acc, album) => acc.concat(album.photos ?? []),
      []
    );
  }

  allPhotos(): void {
    this.showAllPhotos = !this.showAllPhotos;
  }
}
