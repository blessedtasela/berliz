import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { LikerResponse } from 'src/app/models/comment.interface';
import { CommentService } from 'src/app/services/comment.service';
import { PostService } from 'src/app/services/post.service';

export interface LikersModalData {
  /** Which entity's likers to list. */
  kind: 'post' | 'comment';
  id: number;
  /** Where a liker's name/avatar links -- '/dashboard/user' in the shell, '/user' on public pages. */
  routePrefix?: string;
}

/**
 * "Liked by" list for a post or a comment. Opened from the like count on a
 * post card or a comment. The backend already block-filters the list, so this
 * just renders whatever it gets. Tapping a row navigates to that user's
 * profile (and closes the dialog).
 */
@Component({
  selector: 'app-likers-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <div class="bg-white rounded-2xl w-full max-w-sm shadow-xl flex flex-col max-h-[70vh]">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 class="text-sm font-bold text-gray-900">Liked by</h2>
        <button type="button" (click)="dialogRef.close()"
          class="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition text-gray-400">
          <i-feather name="x" style="width:14px;height:14px;"></i-feather>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-2">
        <div *ngIf="loading" class="flex items-center justify-center py-8">
          <i-feather name="loader" class="animate-spin text-gray-300" style="width:18px;height:18px;"></i-feather>
        </div>

        <div *ngIf="!loading && error" class="flex flex-col items-center gap-2 py-8">
          <p class="text-xs text-gray-400">Couldn't load the list.</p>
          <button type="button" (click)="load()" class="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1.5">
            <i-feather name="refresh-cw" style="width:11px;height:11px;"></i-feather> Retry
          </button>
        </div>

        <p *ngIf="!loading && !error && likers.length === 0" class="text-center text-xs text-gray-400 py-8">
          No likes yet.
        </p>

        <a *ngFor="let liker of likers; trackBy: trackById"
          [routerLink]="[routePrefix, liker.username || liker.userId]" (click)="dialogRef.close()"
          class="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition">
          <img *ngIf="photoSrc(liker) as src" [src]="src" alt="" noZoom
            class="w-9 h-9 rounded-full object-cover object-top border border-gray-200 shrink-0" />
          <div *ngIf="!photoSrc(liker)" class="w-9 h-9 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
            <i-feather name="user" class="text-sky-500" style="width:14px;height:14px;"></i-feather>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold text-gray-900 capitalize truncate">{{ liker.name }}</p>
            <p *ngIf="liker.username" class="text-[10px] text-sky-500 truncate">&#64;{{ liker.username }}</p>
          </div>
        </a>
      </div>
    </div>
  `,
})
export class LikersModalComponent {
  likers: LikerResponse[] = [];
  loading = false;
  error = false;
  routePrefix: string;

  constructor(
    private postService: PostService,
    private commentService: CommentService,
    public dialogRef: MatDialogRef<LikersModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LikersModalData,
  ) {
    this.routePrefix = data.routePrefix || '/dashboard/user';
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;
    const request$ = this.data.kind === 'post'
      ? this.postService.getPostLikes(this.data.id)
      : this.commentService.getCommentLikes(this.data.id);

    request$.pipe(take(1)).subscribe({
      next: res => {
        this.loading = false;
        this.likers = res.data ?? [];
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  photoSrc(liker: LikerResponse): string | null {
    return liker.profilePhoto ? 'data:image/*;base64,' + liker.profilePhoto : null;
  }

  trackById(_: number, liker: LikerResponse): number {
    return liker.userId;
  }
}
