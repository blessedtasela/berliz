import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { PostResponse } from 'src/app/models/post.interface';
import { WorkoutResponse } from 'src/app/models/workout.interface';
import { SavedService } from 'src/app/services/saved.service';
import { WorkoutService } from 'src/app/services/workout.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { genericError } from 'src/validators/form-validators.module';
import { memoizePhotoUriByKey } from 'src/app/shared/photo-lightbox/photo-data-uri';

/**
 * Bookmarked posts and workout templates — `/dashboard/saved`. Used to be a
 * small dialog opened from the profile menu; promoted to its own routed page
 * (same reasoning as My Drafts) so it's deep-linkable and bookmarkable in
 * its own right rather than only reachable by clicking through the menu.
 */
@Component({
    selector: 'app-saved-page',
    imports: [CommonModule, RouterModule, IconsModule, StrapiUrlPipe, LoadErrorComponent],
    templateUrl: './saved-page.component.html'
})
export class SavedPageComponent implements OnInit {
  posts: PostResponse[] = [];
  workouts: WorkoutResponse[] = [];
  loading = true;
  /** Set when the saved list failed to load; shown inline with a retry instead of the empty state. */
  loadError: string | null = null;
  cloningId: number | null = null;

  /**
   * Profile photos are stored as bare base64, never as a Strapi media path --
   * they must go through photoDataUri, not the strapiUrl pipe (see its own
   * doc comment: "Does NOT apply to user profile photos"). Piping a bare
   * base64 string through strapiUrl treated it as a relative Strapi path and
   * produced a garbage 404 URL, so the <img> rendered but never showed
   * anything. Matches the pattern dashboard-timeline already uses.
   */
  private readonly authorPhotoUri = memoizePhotoUriByKey();
  authorPhotoSrc(post: PostResponse): string | null {
    return this.authorPhotoUri(post.id, post.authorPhoto);
  }

  constructor(
    private savedService: SavedService,
    private workoutService: WorkoutService,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.loadError = null;
    this.savedService.list().pipe(take(1)).subscribe({
      next: res => {
        this.loading = false;
        this.posts = res.data?.posts ?? [];
        this.workouts = res.data?.workouts ?? [];
      },
      error: (err: any) => { this.loading = false; this.loadError = err?.error?.message || genericError; },
    });
  }

  remove(type: 'POST' | 'WORKOUT', id: number, item: PostResponse | WorkoutResponse): void {
    this.savedService.toggle(type, id); // it's currently saved -> this unsaves
    if (type === 'POST') this.posts = this.posts.filter(p => p !== item);
    else this.workouts = this.workouts.filter(w => w !== item);
  }

  clone(w: WorkoutResponse): void {
    if (this.cloningId === w.id) return;
    this.cloningId = w.id;
    this.workoutService.cloneTemplate(w.id).pipe(take(1)).subscribe({
      next: () => { this.cloningId = null; this.snackBar.openSnackBar('Added to your workouts', ''); },
      error: () => { this.cloningId = null; this.snackBar.openSnackBar('Could not add this workout', 'error'); },
    });
  }
}
