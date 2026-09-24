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

/**
 * Bookmarked posts and workout templates — `/dashboard/saved`. Used to be a
 * small dialog opened from the profile menu; promoted to its own routed page
 * (same reasoning as My Drafts) so it's deep-linkable and bookmarkable in
 * its own right rather than only reachable by clicking through the menu.
 */
@Component({
  selector: 'app-saved-page',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  templateUrl: './saved-page.component.html',
})
export class SavedPageComponent implements OnInit {
  posts: PostResponse[] = [];
  workouts: WorkoutResponse[] = [];
  loading = true;
  cloningId: number | null = null;

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
    this.savedService.list().pipe(take(1)).subscribe({
      next: res => {
        this.loading = false;
        this.posts = res.data?.posts ?? [];
        this.workouts = res.data?.workouts ?? [];
      },
      error: () => { this.loading = false; },
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
