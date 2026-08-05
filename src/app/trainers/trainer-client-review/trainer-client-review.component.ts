import { Component, Input } from '@angular/core';
import { PhotoResponse } from 'src/app/models/Media.interface';
import { TrainerReview } from 'src/app/models/trainers.interface';
import { environment } from 'src/environments/environment';

/**
 * Public read-only rendering of a trainer's client reviews
 * (before / after transformation photos + the written review).
 */
@Component({
  selector: 'app-trainer-client-review',
  templateUrl: './trainer-client-review.component.html',
  styleUrls: ['./trainer-client-review.component.css']
})
export class TrainerClientReviewComponent {

  @Input() trainerReview: TrainerReview[] = [];

  readonly PAGE_SIZE = 4;
  readonly strapiUrl = environment.strapiUrl;

  showAllReviews = false;

  get visibleReviews(): TrainerReview[] {
    return this.showAllReviews
      ? this.trainerReview
      : this.trainerReview.slice(0, this.PAGE_SIZE);
  }

  allReviews(): void {
    this.showAllReviews = !this.showAllReviews;
  }

  /** Only render the before/after pair when both photos actually exist. */
  hasTransformation(review: TrainerReview): boolean {
    return !!review?.photoFrontBefore?.photoUrl && !!review?.photoFrontAfter?.photoUrl;
  }

  photoUrl(photo: PhotoResponse | undefined | null): string {
    const url = photo?.photoUrl;
    if (!url) return 'assets/avatar.png';
    return url.startsWith('http') ? url : `${this.strapiUrl}${url}`;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }
}
