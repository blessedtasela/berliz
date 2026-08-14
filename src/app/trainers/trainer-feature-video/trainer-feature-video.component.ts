import { Component, Input } from '@angular/core';
import { TrainerFeatureVideo } from 'src/app/models/trainers.interface';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';

/**
 * Public read-only rendering of a trainer's feature videos.
 * Fed from `loadActiveTrainerFeatureVideos({ trainerId })`, so the list is
 * already scoped to a single trainer.
 */
@Component({
  selector: 'app-trainer-feature-video',
  templateUrl: './trainer-feature-video.component.html',
  styleUrls: ['./trainer-feature-video.component.css']
})
export class TrainerFeatureVideoComponent {

  @Input() trainerVideos: TrainerFeatureVideo[] = [];

  videoUrl(video: TrainerFeatureVideo): string {
    const url = video?.video?.playbackUrl
      || video?.video?.secureUrl
      || video?.video?.videoUrl
      || '';

    return resolveStrapiUrl(url);
  }
}
