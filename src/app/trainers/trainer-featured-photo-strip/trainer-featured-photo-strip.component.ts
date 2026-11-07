import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TrainerFeaturedPhoto } from 'src/app/models/trainers.interface';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';

/**
 * Public read-only rendering of a trainer's featured photos (PF-40).
 * Fed from `loadFeaturedPhotos({ trainerId })`, so the list is already
 * scoped to a single trainer.
 */
@Component({
    selector: 'app-trainer-featured-photo-strip',
    templateUrl: './trainer-featured-photo-strip.component.html',
    styleUrls: ['./trainer-featured-photo-strip.component.css'],
    standalone: false
})
export class TrainerFeaturedPhotoStripComponent {

  @Input() photos: TrainerFeaturedPhoto[] = [];
  @Output() viewAllPhotos = new EventEmitter<void>();

  photoUrl(featured: TrainerFeaturedPhoto): string {
    return resolveStrapiUrl(featured?.photo?.photoUrl);
  }
}
