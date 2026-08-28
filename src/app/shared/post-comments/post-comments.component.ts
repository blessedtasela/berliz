import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IconsModule } from 'src/app/icons/icons.module';
import { PostResponse } from 'src/app/models/post.interface';
import { CommentResponse } from 'src/app/models/comment.interface';
import { CommentService } from 'src/app/services/comment.service';
import { CurrentUserPhotoService } from 'src/app/services/current-user-photo.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

/** One chunk of a comment's text -- either plain text, or an `@username` mention that should link out. Rendered via *ngFor so no innerHTML/sanitizer is ever needed for user-generated text. */
interface CommentPart {
  text: string;
  mention?: string;
}

/**
 * The comment thread for one post -- list + add/delete + `@username` mention
 * linking. Reused everywhere a post card can appear (dashboard-timeline's
 * feed/my-timeline, and the read-only Timeline sections on both profile
 * pages) so the load/add/delete/mention logic lives in exactly one place.
 *
 * The parent owns whether the thread is open (a per-post toggle button next
 * to Like, styled to match that page's own action bar -- kept in each parent
 * rather than here since it needs to sit inside that bar's flex row, while
 * this panel renders full-width below it) and passes `post` + `open` down;
 * comments are fetched lazily the first time `open` flips true.
 */
@Component({
  selector: 'app-post-comments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconsModule],
  templateUrl: './post-comments.component.html'
})
export class PostCommentsComponent implements OnChanges {
  @Input() post!: PostResponse;
  @Input() open = false;
  /** Where a commenter's name/avatar links to -- '/dashboard/user' inside the dashboard shell, '/user' on the public profile page. */
  @Input() profileRoutePrefix: string = '/dashboard/user';
  /** The dashboard shell is light-themed; the public profile page (`/user/:username`) is dark -- flips the panel's palette to match instead of looking pasted-in. */
  @Input() dark = false;

  comments: CommentResponse[] = [];
  private loaded = false;
  loading = false;

  draft = '';
  posting = false;

  myPhotoSrc = '../../../assets/icons/user.png';

  constructor(
    private commentService: CommentService,
    private currentUserPhoto: CurrentUserPhotoService,
    private snackBarService: SnackBarService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && !this.loaded && !this.loading) {
      this.load();
      this.currentUserPhoto.get().subscribe(src => this.myPhotoSrc = src);
    }
  }

  private load(): void {
    this.loading = true;
    this.commentService.getComments(this.post.id).subscribe({
      next: res => {
        this.loading = false;
        this.loaded = true;
        this.comments = res.data ?? [];
      },
      error: () => {
        this.loading = false;
        this.snackBarService.openSnackBar('Could not load comments', 'error');
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

  remove(comment: CommentResponse): void {
    if (!confirm('Delete this comment?')) return;

    this.commentService.deleteComment(comment.id).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== comment.id);
        this.post.commentCount = Math.max(0, (this.post.commentCount ?? 1) - 1);
      },
      error: () => this.snackBarService.openSnackBar('Could not delete comment', 'error'),
    });
  }

  commentPhotoSrc(comment: CommentResponse): string | null {
    return comment.authorPhoto ? 'data:image/*;base64,' + comment.authorPhoto : null;
  }

  /** Splits a comment's text into plain-text and @mention chunks so the template can render mentions as links via *ngFor -- never innerHTML, so user-generated text can never inject markup. */
  parseMentions(content: string): CommentPart[] {
    const parts: CommentPart[] = [];
    const re = /@([a-zA-Z0-9_]{3,30})/g;
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      if (m.index > lastIndex) parts.push({ text: content.slice(lastIndex, m.index) });
      parts.push({ text: m[0], mention: m[1].toLowerCase() });
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < content.length) parts.push({ text: content.slice(lastIndex) });
    return parts;
  }

  trackByCommentId(_: number, comment: CommentResponse): number {
    return comment.id;
  }
}
