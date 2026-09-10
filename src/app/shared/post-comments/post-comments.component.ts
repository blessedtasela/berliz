import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { PostResponse } from 'src/app/models/post.interface';
import { CommentResponse } from 'src/app/models/comment.interface';
import { CommentService } from 'src/app/services/comment.service';
import { CurrentUserPhotoService } from 'src/app/services/current-user-photo.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { MentionInputComponent } from 'src/app/shared/mention-input/mention-input.component';
import { CommentNodeComponent } from './comment-node.component';

/**
 * The comment thread for one post: the top-level list + "load earlier" paging
 * + the add-a-comment box. Each row is a CommentNodeComponent, which owns its
 * own like / reply / edit / report / nested-replies behaviour.
 *
 * The parent page owns whether the thread is open (a per-post toggle in its
 * own action bar) and passes `post` + `open` down; comments are fetched
 * lazily the first time `open` flips true, and re-fetched if the bound `post`
 * is swapped (feed refresh) while open.
 */
@Component({
  selector: 'app-post-comments',
  standalone: true,
  imports: [CommonModule, IconsModule, MentionInputComponent, CommentNodeComponent],
  templateUrl: './post-comments.component.html'
})
export class PostCommentsComponent implements OnChanges {
  @Input() post!: PostResponse;
  @Input() open = false;
  /** Where a commenter's name/avatar links to -- '/dashboard/user' inside the shell, '/user' on the public profile page. */
  @Input() profileRoutePrefix: string = '/dashboard/user';
  /** The dashboard shell is light-themed; the public profile page is dark -- flips the panel's palette to match. */
  @Input() dark = false;

  /** Top-level comments, chronological (oldest-first) for display -- the backend serves pages newest-first, see load()/loadMore(). */
  comments: CommentResponse[] = [];
  /** The post id `comments` were last successfully loaded for -- reset when the bound post changes so a feed refresh re-fetches instead of showing a stale thread. */
  private loadedForPostId: number | null = null;
  loading = false;
  /** True when the last load failed -- the template shows a retry affordance instead of the identical-looking "no comments yet" empty state. */
  loadError = false;

  private readonly pageSize = 10;
  private nextPage = 0;
  hasMore = false;
  loadingMore = false;

  draft = '';
  posting = false;

  myPhotoSrc = '../../../assets/icons/user.png';

  constructor(
    private commentService: CommentService,
    private currentUserPhoto: CurrentUserPhotoService,
    private snackBarService: SnackBarService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const openedNow = changes['open']?.currentValue === true;
    const postSwapped = !!changes['post'] && !changes['post'].firstChange
      && changes['post'].previousValue?.id !== this.post?.id;

    if (this.open && !this.loading && this.loadedForPostId !== this.post?.id && (openedNow || postSwapped)) {
      this.load();
      this.currentUserPhoto.get().subscribe(src => this.myPhotoSrc = src);
    }
  }

  /** Manual re-attempt after a failed load (the template's "Retry"). */
  retryLoad(): void {
    if (this.loading) return;
    this.load();
  }

  /** Loads the most recent page (page 0). */
  private load(): void {
    this.loading = true;
    this.loadError = false;
    this.commentService.getComments(this.post.id, 0, this.pageSize).subscribe({
      next: res => {
        this.loading = false;
        this.loadedForPostId = this.post.id;
        this.comments = [...(res.data?.comments ?? [])].reverse();
        this.hasMore = res.data?.hasMore ?? false;
        this.nextPage = 1;
      },
      error: () => {
        this.loading = false;
        // Leave `loadedForPostId` unset so re-opening / Retry re-attempts.
        this.loadError = true;
        this.snackBarService.openSnackBar('Could not load comments', 'error');
      },
    });
  }

  /** Fetches the next (older) page and prepends it above what's already shown. */
  loadMore(): void {
    if (this.loadingMore || !this.hasMore) return;

    this.loadingMore = true;
    this.commentService.getComments(this.post.id, this.nextPage, this.pageSize).subscribe({
      next: res => {
        this.loadingMore = false;
        const older = [...(res.data?.comments ?? [])].reverse();
        this.comments = [...older, ...this.comments];
        this.hasMore = res.data?.hasMore ?? false;
        this.nextPage += 1;
      },
      error: () => {
        this.loadingMore = false;
        this.snackBarService.openSnackBar('Could not load earlier comments', 'error');
      },
    });
  }

  submit(): void {
    const content = this.draft.trim();
    if (!content || this.posting) return;

    this.posting = true;
    this.commentService.addComment({ postId: this.post.id, content }).subscribe({
      next: res => {
        this.posting = false;
        const comment = res.data;
        if (!comment) return;
        this.comments = [...this.comments, comment];
        this.draft = '';
        this.post.commentCount = (this.post.commentCount ?? 0) + 1;
      },
      error: () => {
        this.posting = false;
        this.snackBarService.openSnackBar('Could not post comment — try again', 'error');
      },
    });
  }

  /** A node deleted itself (and its subtree, server-side) -- drop it and correct the post counter. */
  onCommentRemoved(comment: CommentResponse): void {
    this.comments = this.comments.filter(c => c.id !== comment.id);
    this.post.commentCount = Math.max(0, (this.post.commentCount ?? 1) - 1 - (comment.replyCount ?? 0));
  }

  trackByCommentId(_: number, comment: CommentResponse): number {
    return comment.id;
  }
}
