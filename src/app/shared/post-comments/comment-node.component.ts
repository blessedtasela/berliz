import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { PostResponse } from 'src/app/models/post.interface';
import { CommentResponse } from 'src/app/models/comment.interface';
import { CommentService } from 'src/app/services/comment.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ContentReportService } from 'src/app/services/content-report.service';
import { LikersModalComponent } from 'src/app/shared/likers-modal/likers-modal.component';
import { MentionInputComponent } from 'src/app/shared/mention-input/mention-input.component';

/** One chunk of a comment's text -- plain text, or an `@username` mention that links out. Rendered via *ngFor so user-generated text never touches innerHTML. */
interface CommentPart {
  text: string;
  mention?: string;
}

/**
 * One comment in a thread, plus everything you can do to it: like, reply,
 * edit, report, delete -- and its own (lazily loaded) nested replies, which
 * are just more CommentNodeComponents. Recurses to arbitrary depth; visual
 * indentation is capped so deep threads don't march off the right edge.
 *
 * State (editing / reporting / replying / which replies are loaded) is
 * per-node, so many comments can be in different modes at once. Mutations go
 * straight to CommentService (the established pattern -- see
 * [[project_ngrx_migration]]); `removed` bubbles up so the parent list and
 * the post's comment counter stay in sync.
 */
@Component({
  selector: 'app-comment-node',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconsModule, MatDialogModule, MentionInputComponent, CommentNodeComponent],
  templateUrl: './comment-node.component.html',
})
export class CommentNodeComponent {
  @Input() comment!: CommentResponse;
  @Input() post!: PostResponse;
  @Input() dark = false;
  @Input() profileRoutePrefix = '/dashboard/user';
  @Input() depth = 0;

  /** Emitted after this comment (and its whole subtree) is deleted server-side. */
  @Output() removed = new EventEmitter<CommentResponse>();

  editing = false;
  editDraft = '';
  savingEdit = false;

  reporting = false;
  reportReason = '';
  submittingReport = false;

  replying = false;
  replyDraft = '';
  postingReply = false;

  /** Direct replies, oldest-first (the backend serves replies ascending). Shown once `repliesOpen`. */
  replies: CommentResponse[] = [];
  repliesOpen = false;
  repliesLoading = false;
  private repliesLoaded = false;
  private replyPage = 0;
  repliesHasMore = false;
  loadingMoreReplies = false;
  private readonly replyPageSize = 10;

  constructor(
    private commentService: CommentService,
    private snackBar: SnackBarService,
    private contentReportService: ContentReportService,
    private dialog: MatDialog,
  ) {}

  photoSrc(): string | null {
    return this.comment.authorPhoto ? 'data:image/*;base64,' + this.comment.authorPhoto : null;
  }

  /** Splits the comment into plain-text and @mention chunks for the template's *ngFor. */
  parts(): CommentPart[] {
    const out: CommentPart[] = [];
    const re = /@([a-zA-Z0-9_]{3,30})/g;
    const content = this.comment.content ?? '';
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      if (m.index > last) out.push({ text: content.slice(last, m.index) });
      out.push({ text: m[0], mention: m[1].toLowerCase() });
      last = m.index + m[0].length;
    }
    if (last < content.length) out.push({ text: content.slice(last) });
    return out;
  }

  trackByCommentId(_: number, comment: CommentResponse): number {
    return comment.id;
  }

  // ── Like ─────────────────────────────────────────────────────────────────

  toggleLike(): void {
    const c = this.comment;
    const wasLiked = c.likedByMe;
    c.likedByMe = !wasLiked;
    c.likeCount = Math.max(0, (c.likeCount ?? 0) + (wasLiked ? -1 : 1));

    this.commentService.toggleCommentLike(c.id).pipe(take(1)).subscribe({
      next: res => {
        if (!res.data) return;
        c.likedByMe = res.data.likedByMe;
        c.likeCount = res.data.likeCount;
      },
      error: () => {
        c.likedByMe = wasLiked;
        c.likeCount = Math.max(0, (c.likeCount ?? 0) + (wasLiked ? 1 : -1));
        this.snackBar.openSnackBar('Could not update like', 'error');
      },
    });
  }

  openLikers(): void {
    this.dialog.open(LikersModalComponent, {
      width: '380px',
      maxWidth: '95vw',
      data: { kind: 'comment', id: this.comment.id, routePrefix: this.profileRoutePrefix },
    });
  }

  // ── Edit ─────────────────────────────────────────────────────────────────

  startEdit(): void {
    this.editing = true;
    this.editDraft = this.comment.content;
    this.reporting = false;
  }

  cancelEdit(): void {
    this.editing = false;
    this.editDraft = '';
  }

  saveEdit(): void {
    const content = this.editDraft.trim();
    if (!content || this.savingEdit) return;

    this.savingEdit = true;
    this.commentService.updateComment({ id: this.comment.id, postId: this.post.id, content }).subscribe({
      next: res => {
        this.savingEdit = false;
        const updated = res.data;
        if (!updated) return;
        // Patch text-only fields -- the update response is mapped without
        // like context, so don't clobber likeCount / likedByMe / replyCount.
        this.comment.content = updated.content;
        this.comment.lastUpdate = updated.lastUpdate;
        this.comment.mentionedUsernames = updated.mentionedUsernames;
        this.cancelEdit();
      },
      error: () => {
        this.savingEdit = false;
        this.snackBar.openSnackBar('Could not update comment — try again', 'error');
      },
    });
  }

  // ── Report ───────────────────────────────────────────────────────────────

  startReport(): void {
    this.reporting = true;
    this.reportReason = '';
    this.editing = false;
  }

  cancelReport(): void {
    this.reporting = false;
    this.reportReason = '';
  }

  submitReport(): void {
    if (this.submittingReport) return;

    this.submittingReport = true;
    this.contentReportService.addReport({
      targetType: 'comment',
      targetId: this.comment.id,
      reason: this.reportReason.trim() || undefined,
    }).subscribe({
      next: res => {
        this.submittingReport = false;
        this.snackBar.openSnackBar(res.data?.message || 'Report submitted', '');
        this.cancelReport();
      },
      error: err => {
        this.submittingReport = false;
        this.snackBar.openSnackBar(err.error?.message || 'Could not submit report', 'error');
      },
    });
  }

  // ── Reply ────────────────────────────────────────────────────────────────

  toggleReply(): void {
    this.replying = !this.replying;
    if (this.replying && !this.repliesOpen && this.comment.replyCount > 0) this.openReplies();
  }

  submitReply(): void {
    const content = this.replyDraft.trim();
    if (!content || this.postingReply) return;

    this.postingReply = true;
    this.commentService.addComment({ postId: this.post.id, parentId: this.comment.id, content }).subscribe({
      next: res => {
        this.postingReply = false;
        const reply = res.data;
        if (!reply) return;
        this.replies = [...this.replies, reply];
        this.comment.replyCount = (this.comment.replyCount ?? 0) + 1;
        this.post.commentCount = (this.post.commentCount ?? 0) + 1;
        this.replyDraft = '';
        this.replying = false;
        this.repliesOpen = true;
        this.repliesLoaded = true;
      },
      error: () => {
        this.postingReply = false;
        this.snackBar.openSnackBar('Could not post reply — try again', 'error');
      },
    });
  }

  // ── Replies list ─────────────────────────────────────────────────────────

  openReplies(): void {
    this.repliesOpen = true;
    if (this.repliesLoaded || this.repliesLoading) return;

    this.repliesLoading = true;
    this.commentService.getReplies(this.comment.id, 0, this.replyPageSize).subscribe({
      next: res => {
        this.repliesLoading = false;
        this.repliesLoaded = true;
        this.replies = res.data?.comments ?? [];
        this.repliesHasMore = res.data?.hasMore ?? false;
        this.replyPage = 1;
      },
      error: () => {
        this.repliesLoading = false;
        this.snackBar.openSnackBar('Could not load replies', 'error');
      },
    });
  }

  closeReplies(): void {
    this.repliesOpen = false;
  }

  loadMoreReplies(): void {
    if (this.loadingMoreReplies || !this.repliesHasMore) return;

    this.loadingMoreReplies = true;
    this.commentService.getReplies(this.comment.id, this.replyPage, this.replyPageSize).subscribe({
      next: res => {
        this.loadingMoreReplies = false;
        this.replies = [...this.replies, ...(res.data?.comments ?? [])];
        this.repliesHasMore = res.data?.hasMore ?? false;
        this.replyPage += 1;
      },
      error: () => {
        this.loadingMoreReplies = false;
        this.snackBar.openSnackBar('Could not load more replies', 'error');
      },
    });
  }

  onChildRemoved(child: CommentResponse): void {
    this.replies = this.replies.filter(r => r.id !== child.id);
    this.comment.replyCount = Math.max(0, (this.comment.replyCount ?? 1) - 1);
    // The child took its own subtree with it server-side; drop that from the post total too.
    this.post.commentCount = Math.max(0, (this.post.commentCount ?? 1) - 1 - (child.replyCount ?? 0));
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  remove(): void {
    if (!confirm(this.comment.replyCount > 0
      ? 'Delete this comment and all its replies?'
      : 'Delete this comment?')) return;

    this.commentService.deleteComment(this.comment.id).subscribe({
      next: () => this.removed.emit(this.comment),
      error: () => this.snackBar.openSnackBar('Could not delete comment', 'error'),
    });
  }
}
