import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { addCenterReview, addCenterReviewSuccess, addCenterReviewFailure } from 'src/app/state/center/center.actions';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

/**
 * "Leave a review" form for a center's public profile. Context-aware: the
 * center is already known from the page it's embedded in, so there's no
 * "who is this about" picker — centerId comes in as an @Input from the
 * parent (center-detail) page.
 *
 * Submission is gated to logged-in members; actual eligibility (must have a
 * completed booking with this center) is enforced server-side and surfaced
 * as an error if the user doesn't qualify, rather than pre-checked here.
 */
@Component({
  selector: 'app-center-review-form',
  templateUrl: './center-review-form.component.html',
  styleUrls: ['./center-review-form.component.css']
})
export class CenterReviewFormComponent implements OnInit, OnDestroy {
  @Input() centerId!: number;

  user: Users | null = null;
  reviewForm: FormGroup;
  submitting = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private actions$: Actions,
    private router: Router,
    private snackBar: SnackBarService,
  ) {
    this.reviewForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    this.store.dispatch(loadUser());
    this.store.select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.user = user);

    this.actions$
      .pipe(ofType(addCenterReviewSuccess), takeUntil(this.destroy$))
      .subscribe(() => {
        this.submitting = false;
        this.reviewForm.reset();
        this.snackBar.openSnackBar('Your review has been submitted for approval.', '');
      });

    this.actions$
      .pipe(ofType(addCenterReviewFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => {
        this.submitting = false;
        this.snackBar.openSnackBar(error || genericError, 'error');
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
    if (this.reviewForm.invalid || this.submitting || !this.centerId) return;

    this.submitting = true;
    // Backend expects Map<String, String> — centerId must be sent as a string.
    this.store.dispatch(addCenterReview({
      data: {
        centerId: String(this.centerId),
        comment: this.reviewForm.value.comment,
      }
    }));
  }
}
