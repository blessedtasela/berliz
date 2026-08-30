import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { PostResponse } from 'src/app/models/post.interface';
import { CommentResponse } from 'src/app/models/comment.interface';
import { PublicDirectoryEntry } from 'src/app/models/users.interface';
import { CommentService } from 'src/app/services/comment.service';
import { CurrentUserPhotoService } from 'src/app/services/current-user-photo.service';
import { UserService } from 'src/app/services/user.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ContentReportService } from 'src/app/services/content-report.service';

/** One chunk of a comment's text -- either plain text, or an `@username` mention that should link out. Rendered via *ngFor so no innerHTML/sanitizer is ever needed for user-generated text. */
interface CommentPart {
  text: string;
  mention?: string;
}

/** Matches an in-progress `@handle` right at the end of the text up to the cursor -- ^ or whitespace before it, so "email@x" mid-word never triggers suggestions. */
const MENTION_IN_PROGRESS = /(?:^|\s)@([a-zA-Z0-9_]{0,30})$/;

/**
 * The comment thread for one post -- list + add/edit/delete + `@username`
 * mention linking and autocomplete. Reused everywhere a post card can appear
 * (dashboard-timeline's feed/my-timeline, and the read-only Timeline
 * sections on both profile pages) so this logic lives in exactly one place.
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
export class PostCommentsComponent implements OnChanges, OnDestroy {
  @Input() post!: PostResponse;
  @Input() open = false;
  /** Where a commenter's name/avatar links to -- '/dashboard/user' inside the dashboard shell, '/user' on the public profile page. */
  @Input() profileRoutePrefix: string = '/dashboard/user';
  /** The dashboard shell is light-themed; the public profile page (`/user/:username`) is dark -- flips the panel's palette to match instead of looking pasted-in. */
  @Input() dark = false;

  @ViewChild('draftInput') draftInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('editInput') editInputRef?: ElementRef<HTMLInputElement>;

  /** Always kept in chronological (oldest-first) order for display, even though the backend serves pages newest-first -- see load()/loadMore(). */
  comments: CommentResponse[] = [];
  private loaded = false;
  loading = false;

  /** Comments per page, and the next page index to request (0 = most recent). */
  private readonly pageSize = 10;
  private nextPage = 0;
  hasMore = false;
  loadingMore = false;

  draft = '';
  posting = false;

  editingCommentId: number | null = null;
  editDraft = '';
  savingEdit = false;

  reportingCommentId: number | null = null;
  reportReason = '';
  submittingReport = false;

  /** '@' autocomplete -- shared between the add box and whichever comment is being edited, since only one can be focused at a time. */
  mentionActiveField: 'draft' | 'edit' | null = null;
  mentionSuggestions: PublicDirectoryEntry[] = [];
  private mentionQuery$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  myPhotoSrc = '../../../assets/icons/user.png';

  constructor(
    private commentService: CommentService,
    private currentUserPhoto: CurrentUserPhotoService,
    private userService: UserService,
    private snackBarService: SnackBarService,
    private contentReportService: ContentReportService,
  ) {
    this.mentionQuery$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(q => this.userService.getPublicDirectory(q, null)),
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => this.mentionSuggestions = (res.data ?? []).slice(0, 6),
      error: () => this.mentionSuggestions = [],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && !this.loaded && !this.loading) {
      this.load();
      this.currentUserPhoto.get().subscribe(src => this.myPhotoSrc = src);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Loads the most recent page (page 0). */
  private load(): void {
    this.loading = true;
    this.commentService.getComments(this.post.id, 0, this.pageSize).subscribe({
      next: res => {
        this.loading = false;
        this.loaded = true;
        // The backend serves newest-first; reverse this page to chronological
        // (oldest-first) order for display -- "load earlier" then prepends
        // each further-back page the same way.
        this.comments = [...(res.data?.comments ?? [])].reverse();
        this.hasMore = res.data?.hasMore ?? false;
        this.nextPage = 1;
      },
      error: () => {
        this.loading = false;
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
        this.closeMentions();
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
        if (this.editingCommentId === comment.id) this.cancelEdit();
      },
      error: () => this.snackBarService.openSnackBar('Could not delete comment', 'error'),
    });
  }

  // ── Edit ─────────────────────────────────────────────────────────────────

  startEdit(comment: CommentResponse): void {
    this.editingCommentId = comment.id;
    this.editDraft = comment.content;
    this.closeMentions();
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editDraft = '';
    this.closeMentions();
  }

  saveEdit(comment: CommentResponse): void {
    const content = this.editDraft.trim();
    if (!content || this.savingEdit) return;

    this.savingEdit = true;
    this.commentService.updateComment({ id: comment.id, postId: this.post.id, content }).subscribe({
      next: res => {
        this.savingEdit = false;
        const updated = res.data;
        if (!updated) return;
        const idx = this.comments.findIndex(c => c.id === comment.id);
        if (idx > -1) this.comments[idx] = updated;
        this.cancelEdit();
      },
      error: () => {
        this.savingEdit = false;
        this.snackBarService.openSnackBar('Could not update comment — try again', 'error');
      },
    });
  }

  // ── Report ───────────────────────────────────────────────────────────────

  startReport(comment: CommentResponse): void {
    this.reportingCommentId = comment.id;
    this.reportReason = '';
    this.closeMentions();
  }

  cancelReport(): void {
    this.reportingCommentId = null;
    this.reportReason = '';
  }

  submitReport(comment: CommentResponse): void {
    if (this.submittingReport) return;

    this.submittingReport = true;
    this.contentReportService.addReport({
      targetType: 'comment',
      targetId: comment.id,
      reason: this.reportReason.trim() || undefined,
    }).subscribe({
      next: res => {
        this.submittingReport = false;
        this.snackBarService.openSnackBar(res.data?.message || 'Report submitted', '');
        this.cancelReport();
      },
      error: err => {
        this.submittingReport = false;
        this.snackBarService.openSnackBar(err.error?.message || 'Could not submit report', 'error');
      },
    });
  }

  // ── Mention autocomplete ─────────────────────────────────────────────────

  onDraftInput(input: HTMLInputElement): void {
    this.handleMentionTyping(this.draft, input.selectionStart ?? this.draft.length, 'draft');
  }

  onEditInput(input: HTMLInputElement): void {
    this.handleMentionTyping(this.editDraft, input.selectionStart ?? this.editDraft.length, 'edit');
  }

  private handleMentionTyping(text: string, cursor: number, field: 'draft' | 'edit'): void {
    const upToCursor = text.slice(0, cursor);
    const match = MENTION_IN_PROGRESS.exec(upToCursor);
    if (!match) {
      this.closeMentions();
      return;
    }
    this.mentionActiveField = field;
    this.mentionQuery$.next(match[1]);
  }

  closeMentions(): void {
    this.mentionActiveField = null;
    this.mentionSuggestions = [];
  }

  selectMention(user: PublicDirectoryEntry): void {
    if (!this.mentionActiveField || !user.username) { this.closeMentions(); return; }

    const isDraft = this.mentionActiveField === 'draft';
    const text = isDraft ? this.draft : this.editDraft;
    const inputEl = isDraft ? this.draftInputRef?.nativeElement : this.editInputRef?.nativeElement;
    const cursor = inputEl?.selectionStart ?? text.length;

    const match = MENTION_IN_PROGRESS.exec(text.slice(0, cursor));
    if (!match) { this.closeMentions(); return; }

    // '@' plus the partial query typed so far, immediately before the cursor.
    const atIndex = cursor - 1 - match[1].length;
    const before = text.slice(0, atIndex);
    const after = text.slice(cursor);
    const inserted = `@${user.username} `;
    const newText = before + inserted + after;

    if (isDraft) this.draft = newText; else this.editDraft = newText;
    this.closeMentions();

    setTimeout(() => {
      if (!inputEl) return;
      inputEl.focus();
      const pos = (before + inserted).length;
      inputEl.setSelectionRange(pos, pos);
    });
  }

  suggestionPhotoSrc(entry: PublicDirectoryEntry): string | null {
    return entry.profilePhoto ? 'data:image/*;base64,' + entry.profilePhoto : null;
  }

  trackBySuggestionId(_: number, entry: PublicDirectoryEntry): number {
    return entry.id;
  }

  // ── Display helpers ──────────────────────────────────────────────────────

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
