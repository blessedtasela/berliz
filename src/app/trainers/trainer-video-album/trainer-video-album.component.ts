import { Component, Input } from '@angular/core';
import { VideoResponse } from 'src/app/models/Media.interface';
import { TrainerVideoAlbum } from 'src/app/models/trainers.interface';
import { environment } from 'src/environments/environment';

/**
 * Public read-only rendering of a trainer's video album.
 * `TrainerVideoAlbum.videos` is a `VideoResponse[]`.
 */
@Component({
  selector: 'app-trainer-video-album',
  templateUrl: './trainer-video-album.component.html',
  styleUrls: ['./trainer-video-album.component.css']
})
export class TrainerVideoAlbumComponent {

  @Input() trainerVideoAlbum: TrainerVideoAlbum | null = null;

  readonly strapiUrl = environment.strapiUrl;

  get videos(): VideoResponse[] {
    return this.trainerVideoAlbum?.videos ?? [];
  }

  videoUrl(video: VideoResponse): string {
    const url = video?.playbackUrl || video?.secureUrl || video?.videoUrl || '';
    if (!url) return '';
    return url.startsWith('http') ? url : `${this.strapiUrl}${url}`;
  }
}
