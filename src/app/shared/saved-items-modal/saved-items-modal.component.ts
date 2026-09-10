import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { PostResponse } from 'src/app/models/post.interface';
import { WorkoutResponse } from 'src/app/models/workout.interface';
import { SavedService } from 'src/app/services/saved.service';
import { WorkoutService } from 'src/app/services/workout.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

/** The "Saved" view — bookmarked posts and workout templates, each removable in place. */
@Component({
  selector: 'app-saved-items-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <div class="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[75vh]">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 class="text-sm font-bold text-gray-900">Saved</h2>
        <button type="button" (click)="dialogRef.close()"
          class="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition text-gray-400">
          <i-feather name="x" style="width:14px;height:14px;"></i-feather>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        <div *ngIf="loading" class="flex items-center justify-center py-10">
          <i-feather name="loader" class="animate-spin text-gray-300" style="width:18px;height:18px;"></i-feather>
        </div>

        <p *ngIf="!loading && !posts.length && !workouts.length" class="text-center text-xs text-gray-400 py-10">
          Nothing saved yet. Tap the bookmark on a post or workout to keep it here.
        </p>

        <div *ngIf="!loading && posts.length" class="flex flex-col gap-2">
          <p class="text-[10px] font-bold uppercase tracking-wide text-gray-400 px-1">Posts</p>
          <div *ngFor="let p of posts" class="flex items-start gap-2.5 rounded-xl border border-gray-100 px-3 py-2.5">
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-bold text-gray-900 truncate">{{ p.authorName }}</p>
              <p class="text-xs text-gray-600 line-clamp-2 whitespace-pre-line">{{ p.content }}</p>
            </div>
            <button type="button" (click)="remove('POST', p.id, p)" title="Remove"
              class="shrink-0 text-amber-500 hover:text-amber-700 transition">
              <i-feather name="bookmark" style="width:14px;height:14px;" fill="currentColor"></i-feather>
            </button>
          </div>
        </div>

        <div *ngIf="!loading && workouts.length" class="flex flex-col gap-2">
          <p class="text-[10px] font-bold uppercase tracking-wide text-gray-400 px-1">Workouts</p>
          <div *ngFor="let w of workouts" class="flex items-center gap-2.5 rounded-xl border border-gray-100 px-3 py-2.5">
            <i-feather name="zap" class="text-orange-500 shrink-0" style="width:14px;height:14px;"></i-feather>
            <span class="text-xs font-bold text-gray-800 truncate flex-1">{{ w.name }}</span>
            <button type="button" (click)="clone(w)" [disabled]="cloningId === w.id"
              class="shrink-0 text-[11px] font-semibold text-orange-700 hover:text-orange-900 flex items-center gap-1 transition disabled:opacity-50">
              <i-feather [name]="cloningId === w.id ? 'loader' : 'plus'" [class.animate-spin]="cloningId === w.id" style="width:12px;height:12px;"></i-feather>
              Add
            </button>
            <button type="button" (click)="remove('WORKOUT', w.id, w)" title="Remove"
              class="shrink-0 text-amber-500 hover:text-amber-700 transition">
              <i-feather name="bookmark" style="width:14px;height:14px;" fill="currentColor"></i-feather>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SavedItemsModalComponent {
  posts: PostResponse[] = [];
  workouts: WorkoutResponse[] = [];
  loading = true;
  cloningId: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<SavedItemsModalComponent>,
    private savedService: SavedService,
    private workoutService: WorkoutService,
    private snackBar: SnackBarService,
  ) {
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
