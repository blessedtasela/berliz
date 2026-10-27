import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { addTrainerReview, addTrainerReviewSuccess, addTrainerReviewFailure } from 'src/app/state/trainer/trainer.actions';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { CommonModule } from '@angular/common';
import { IconsModule } from 'src/app/icons/icons.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { StarRatingComponent } from 'src/app/shared/star-rating/star-rating.component';
import { ProfileTheme, ProfileThemeClasses, profileTheme } from 'src/app/shared/provider-profile/profile-theme';

/**
 * "Leave a review" form for a trainer's public profile. Context-aware:
 * the trainer is already known from the page it's embedded in, so unlike a
 * generic review form there's no "who is this about" picker — trainerId
 * comes in as an @Input from the parent (trainers-details) page.
 *
 * Submission is gated to logged-in clients; actual eligibility (must have a
 * completed booking with this trainer) is enforced server-side and surfaced
 * as an error if the user doesn't qualify, rather than pre-checked here.
 */
@Component({
    selector: 'app-trainer-add-review',
    templateUrl: './trainer-add-review.component.html',
    styleUrls: ['./trainer-add-review.component.css'],
    imports: [CommonModule, ReactiveFormsModule, IconsModule, SharedModule, StarRatingComponent],
})
export class TrainerAddReviewComponent implements OnInit, OnDestroy {
  @Input() trainerId: number | undefined;

  /** 'dark' on the public profile, 'light' on the signed-in dashboard (which follows the light/dark toggle). */
  @Input() theme: ProfileTheme = 'dark';

  get t(): ProfileThemeClasses { return profileTheme(this.theme); }

  get inputClass(): string {
    return this.theme === 'dark'
      ? 'border border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500'
      : 'border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400';
  }

  get errorClass(): string { return this.theme === 'dark' ? 'text-red-400' : 'text-red-500'; }

  user: Users | null = null;
  reviewForm: FormGroup;
  submitting = false;
  /** Inline message above the Submit button when the review could not be submitted. */
  submitError: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private actions$: Actions,
    private router: Router,
    private snackBar: SnackBarService,
  ) {
    this.reviewForm = this.fb.group({
      review: ['', [Validators.required, Validators.minLength(10)]],
      rating: [null as number | null, [Validators.required, Validators.min(1), Validators.max(5)]],
    });
  }

  ngOnInit(): void {
    this.store.dispatch(loadUser());
    this.store.select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.user = user);

    this.actions$
      .pipe(ofType(addTrainerReviewSuccess), takeUntil(this.destroy$))
      .subscribe(() => {
        this.submitting = false;
        this.submitError = null;
        this.reviewForm.reset();
        this.snackBar.openSnackBar('Your review has been submitted for approval.', '');
      });

    this.actions$
      .pipe(ofType(addTrainerReviewFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => {
        this.submitting = false;
        this.submitError = error || genericError;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  submit(): void {
    if (this.reviewForm.invalid || this.submitting || !this.trainerId) return;

    this.submitting = true;
    this.submitError = null;
    this.store.dispatch(addTrainerReview({
      data: {
        trainerId: this.trainerId,
        review: this.reviewForm.value.review,
        rating: this.reviewForm.value.rating,
      }
    }));
  }
}
