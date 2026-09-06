import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { Testimonials } from 'src/app/models/testimonials.model';
import { PublicUserProfile } from 'src/app/models/users.interface';
import { WorkoutResponse } from 'src/app/models/workout.interface';
import { PostResponse } from 'src/app/models/post.interface';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PhotoLightboxService } from 'src/app/services/photo-lightbox.service';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';
import { PostCommentsComponent } from 'src/app/shared/post-comments/post-comments.component';
import { LikersModalComponent } from 'src/app/shared/likers-modal/likers-modal.component';
import { AuthRedirectService } from 'src/app/services/auth-redirect.service';

import {
  clearPublicProfile,
  loadPublicProfile,
  loadPublicProfileByUsername,
} from 'src/app/state/user-profile/user-profile.actions';
import {
  selectPublicProfile,
  selectPublicProfileError,
  selectPublicProfileLoading,
} from 'src/app/state/user-profile/user-profile.selector';
import {
  cloneWorkoutTemplate,
  cloneWorkoutTemplateFailure,
  cloneWorkoutTemplateSuccess,
} from 'src/app/state/workout/workout.actions';

/**
 * Public profile page — `/user/:username`, no guard.
 *
 * Renders one of four states: loading, not-found, private, or the full profile.
 * "Private" is a first-class state, not an error: the backend still returns the
 * owner's name, photo, role and join date, and the page shows those with a
 * "this profile is private" note where the rest would be.
 *
 * Standalone so it can be routed to directly without a new NgModule — same
 * pattern the dashboard equipment form modal uses.
 */
@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [ClickablePhotoDirective, CommonModule, RouterModule, IconsModule, MatDialogModule, StrapiUrlPipe, PostCommentsComponent],
  templateUrl: './public-profile.component.html'
})
export class PublicProfileComponent implements OnInit, OnDestroy {

  profile: PublicUserProfile | null = null;
  loading = false;
  error: string | null = null;

  /** Set while a clone request is in flight so the button can show a spinner. */
  cloningTemplateId: number | null = null;

  /** Which post's comment thread (PostCommentsComponent) is expanded inline, if any. Only one open at a time. */
  openCommentsPostId: number | null = null;

  /**
   * The page itself has no route guard so anonymous visitors can land here,
   * but viewing a profile's content requires an account (backend enforces
   * this — SecurityConfig). Checked once in the constructor rather than a
   * field initializer, since a field initializer runs before constructor
   * parameter properties like authService are assigned.
   */
  needsLogin = true;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBarService: SnackBarService,
    public lightbox: PhotoLightboxService,
    public authRedirect: AuthRedirectService,
    private dialog: MatDialog,
  ) {
    this.needsLogin = !this.authService.isAuthenticated();
  }

  /** Opens the "liked by" list for a post. */
  openPostLikers(post: PostResponse): void {
    this.dialog.open(LikersModalComponent, {
      width: '380px',
      maxWidth: '95vw',
      data: { kind: 'post', id: post.id, routePrefix: '/user' },
    });
  }

  ngOnInit(): void {
    if (this.needsLogin) { return; }

    // paramMap (not snapshot) so /user/alice → /user/bob re-fetches without a remount.
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const username = params.get('username');
        if (!username) {
          this.error = 'Invalid profile link';
          return;
        }
        // Admin tables and the user-hover-card link here by numeric id rather
        // than username (they don't carry the target's username). A purely
        // numeric segment is never a real username (signup requires letters),
        // so route it through the by-id lookup instead of a doomed by-username one.
        const asId = Number(username);
        if (username.trim() !== '' && Number.isInteger(asId) && String(asId) === username.trim()) {
          this.store.dispatch(loadPublicProfile({ id: asId }));
        } else {
          this.store.dispatch(loadPublicProfileByUsername({ username }));
        }
      });

    this.store.select(selectPublicProfile)
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => this.profile = profile);

    this.store.select(selectPublicProfileLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.store.select(selectPublicProfileError)
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error = error);

    this.actions$
      .pipe(ofType(cloneWorkoutTemplateSuccess), takeUntil(this.destroy$))
      .subscribe(() => {
        this.cloningTemplateId = null;
        this.snackBarService.openSnackBar('Added to your workouts', '');
        this.router.navigate(['/dashboard/workouts']);
      });

    this.actions$
      .pipe(ofType(cloneWorkoutTemplateFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => {
        this.cloningTemplateId = null;
        this.snackBarService.openSnackBar(error, 'error');
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(clearPublicProfile());
    this.destroy$.next();
    this.destroy$.complete();
  }

  // -------------------------
  // DERIVED VIEW STATE
  // -------------------------

  /** The page resolved but there is no such user (or the request failed). */
  get notFound(): boolean {
    return !this.loading && !this.profile;
  }

  get isPrivate(): boolean {
    return !!this.profile?.isPrivate;
  }

  /** Berliz's super admin viewing a private profile anyway -- the content
   *  block below is populated even though isPrivate stays true. */
  get viewedAsAdminOverride(): boolean {
    return !!this.profile?.viewedAsAdminOverride;
  }

  get fullName(): string {
    if (!this.profile) return '';
    return `${this.profile.firstname ?? ''} ${this.profile.lastname ?? ''}`.trim();
  }

  get photoSrc(): string {
    return this.profile?.profilePhoto
      ? 'data:image/*;base64,' + this.profile.profilePhoto
      : '../../../assets/icons/user.png';
  }

  get location(): string | null {
    if (!this.profile) return null;
    const parts = [this.profile.city, this.profile.country].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  }

  get workouts(): WorkoutResponse[] {
    return this.profile?.workoutsCreated ?? [];
  }

  /** This user's own timeline posts -- backend only populates this when the profile is public. */
  get posts(): PostResponse[] {
    return this.profile?.posts ?? [];
  }

  /** Trainer-only: only ever populated when profile.role === 'trainer'. */
  get testimonials(): Testimonials[] {
    return this.profile?.testimonials ?? [];
  }

  exerciseCount(workout: WorkoutResponse): number {
    return workout.exercises?.length ?? 0;
  }

  /** First three exercise names — the rest collapse into a "+N more" chip. */
  exerciseChips(workout: WorkoutResponse): string[] {
    return (workout.exercises ?? [])
      .slice(0, 3)
      .map(exercise => exercise.exerciseName)
      .filter(Boolean);
  }

  extraExerciseCount(workout: WorkoutResponse): number {
    return Math.max(0, this.exerciseCount(workout) - 3);
  }

  // -------------------------
  // ACTIONS
  // -------------------------

  /**
   * Clone one of this user's templates into the viewer's own workouts.
   * The page itself is public, so an anonymous viewer gets sent to login first.
   */
  quickAdd(template: WorkoutResponse): void {
    if (!this.authService.isAuthenticated()) {
      this.snackBarService.openSnackBar('Log in to add this workout', '');
      this.authRedirect.goToLogin();
      return;
    }

    this.cloningTemplateId = template.id;
    this.store.dispatch(cloneWorkoutTemplate({ id: template.id }));
  }

  trackByWorkoutId(_: number, workout: WorkoutResponse): number {
    return workout.id;
  }

  trackByTestimonialId(_: number, testimonial: Testimonials): number {
    return testimonial.id;
  }

  trackByPostId(_: number, post: PostResponse): number {
    return post.id;
  }

  toggleComments(post: PostResponse): void {
    this.openCommentsPostId = this.openCommentsPostId === post.id ? null : post.id;
  }
}
