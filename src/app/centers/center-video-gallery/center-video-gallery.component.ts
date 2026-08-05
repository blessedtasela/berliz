import { Component, Input, OnChanges } from '@angular/core';
import { CenterVideoAlbum } from 'src/app/models/centers.interface';
import { VideoResponse } from 'src/app/models/Media.interface';

@Component({
  selector: 'app-center-video-gallery',
  templateUrl: './center-video-gallery.component.html',
  styleUrls: ['./center-video-gallery.component.css']
})
export class CenterVideoGalleryComponent implements OnChanges {
  /** Every video album registered by this center. */
  @Input() centerVideoAlbums: CenterVideoAlbum[] = [];

  /** Flattened video wall built from all of the center's albums. */
  videos: VideoResponse[] = [];
  showAllVideos: boolean = false;

  ngOnChanges(): void {
    this.videos = (this.centerVideoAlbums ?? []).reduce<VideoResponse[]>(
      (acc, album) => acc.concat(album.videos ?? []),
      []
    );
  }

  allVideos(): void {
    this.showAllVideos = !this.showAllVideos;
  }
}
