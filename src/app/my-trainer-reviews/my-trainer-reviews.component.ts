import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';
import { TrainerReview } from 'src/app/models/trainers.interface';
import { ClientService } from 'src/app/services/client.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { nameSlug } from 'src/app/utils/closest-slug';
import { genericError } from 'src/validators/form-validators.module';

/** Reviews the signed-in client has written about trainers -- read-only (editing/withdrawing a
 *  submitted review isn't a feature yet); see TrainerReviewComponent for the mirror view a
 *  trainer gets of reviews written about them. */
@Component({
  selector: 'app-my-trainer-reviews',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule, LoadErrorComponent, StrapiUrlPipe],
  providers: [DatePipe],
  templateUrl: './my-trainer-reviews.component.html',
})
export class MyTrainerReviewsComponent implements OnInit {

  reviews: TrainerReview[] = [];
  loading = true;
  loadError: string | null = null;

  constructor(
    private clientService: ClientService,
    private snackBar: SnackBarService,
    private datePipe: DatePipe,
  ) { }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.loadError = null;
    this.clientService.getMyTrainerReviews().pipe(take(1)).subscribe({
      next: res => { this.reviews = res?.data ?? []; this.loading = false; },
      error: err => {
        this.loading = false;
        const message = err?.error?.message || genericError;
        this.loadError = message;
        this.snackBar.openSnackBar(message, 'error');
      },
    });
  }

  trainerSlug(name: string): string {
    return nameSlug(name);
  }

  formatDate(date: unknown): string {
    return this.datePipe.transform(new Date(date as string), 'mediumDate') ?? '';
  }

  /** Any of the 6 before/after slots filled -- a text-only review skips the photo grid entirely. */
  hasPhotos(review: TrainerReview): boolean {
    return !!(review.photoFrontBefore?.photoUrl || review.photoFrontAfter?.photoUrl
      || review.photoSideBefore?.photoUrl || review.photoSideAfter?.photoUrl
      || review.photoBackBefore?.photoUrl || review.photoBackAfter?.photoUrl);
  }
}
