import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PostResponse } from 'src/app/models/post.interface';
import { CommentResponse } from 'src/app/models/comment.interface';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';
import { CommentService } from 'src/app/services/comment.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { UserService } from 'src/app/services/user.service';
import { imageValidator } from 'src/validators/form-validators.module';

type TimelineTab = 'feed' | 'mine';

/** One chunk of a comment's text -- either plain text, or an `@username` mention that should link out. Rendered via *ngFor so no innerHTML/sanitizer is ever needed for user-generated text. */
interface CommentPart {
  text: string;
  mention?: string;
}

/**
 * Compose + view your own posts, and see your accepted connections' posts —
 * `/dashboard/timeline`. Defaults to the Feed tab; toggles to "My Timeline"
 * for just your own posts. Reads from PostService directly (no NgRx slice:
 * the only consumer of this state is this one page, plus the read-only
 * viewer on DashboardUserProfileComponent which fetches its own copy
 * independently).
 */
@Component({
  selector: 'app-dashboard-timeline',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconsModule, SharedModule],
  templateUrl: './dashboard-timeline.component.html'
})
export class DashboardTimelineComponent implements OnInit, OnDestroy {

  tab: TimelineTab = 'feed';

  feedPosts: PostResponse[] = [];
  myPosts: PostResponse[] = [];
  loading = false;

  // ── Compose ──────────────────────────────────────────────────────────────
  draftContent = '';
  posting = false;
  uploadedPhoto: { strapiId: number; photoUrl: string } | null = null;
  uploading = false;
  uploadError: string | null = null;

  currentUserId: number | null = null;
  myPhotoSrc = '../../../assets/icons/user.png';

  /** Feed thumbnails are cropped (object-cover) to keep the feed tidy — clicking one opens the full, uncropped image + caption, IG-style. */
  expandedPost: PostResponse | null = null;

  // ── Comments ─────────────────────────────────────────────────────────────
  /** Which post's comment thread is expanded inline, if any. Only one open at a time. */
  openCommentsPostId: number | null = null;
  commentsByPostId: { [postId: number]: CommentResponse[] } = {};
  loadingCommentsPostId: number | null = null;
  commentDraft: { [postId: number]: string } = {};
  postingComment: { [postId: number]: boolean } = {};

  private destroy$ = new Subject<void>();

  constructor(
    private postService: PostService,
    private commentService: CommentService,
    private strapiService: StrapiService,
    private authService: AuthService,
    private userService: UserService,
    private snackBarService: SnackBarService,
  ) {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  ngOnInit(): void {
    this.refresh();
    this.userService.getUser().subscribe({
      next: res => {
        const photo = res.data?.profilePhoto;
        if (photo) { this.myPhotoSrc = 'data:image/*;base64,' + photo; }
      },
      error: () => { /* keep the placeholder avatar */ },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh(): void {
    this.loading = true;
    const request = this.tab === 'feed' ? this.postService.getFeed() : this.postService.getMyTimeline();
    request.subscribe({
      next: res => {
        this.loading = false;
        if (this.tab === 'feed') { this.feedPosts = res.data ?? []; }
        else { this.myPosts = res.data ?? []; }
      },
      error: () => { this.loading = false; },
    });
  }

  setTab(tab: TimelineTab): void {
    if (this.tab === tab) return;
    this.tab = tab;
    this.refresh();
  }

  get posts(): PostResponse[] {
    return this.tab === 'feed' ? this.feedPosts : this.myPosts;
  }

  // ── Compose ──────────────────────────────────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) return;

    const validationError = imageValidator()({ value: file } as any);
    if (validationError) {
      this.uploadError = validationError['invalidType']
        ? 'Please upload a JPEG, PNG or WebP image'
        : 'Image must be under 5MB';
      return;
    }

    this.uploadError = null;
    this.uploading = true;

    this.strapiService.uploadToStrapi(file).subscribe({
      next: res => {
        this.uploading = false;
        const uploaded = res?.[0];
        if (!uploaded?.url) {
          this.uploadError = 'Upload failed — no file returned';
          return;
        }
        this.uploadedPhoto = { strapiId: uploaded.id, photoUrl: uploaded.url };
      },
      error: (err) => {
        this.uploading = false;
        // The backend surfaces the actual root cause (e.g. Strapi rejected
        // the request, or strapi.base-url/strapi.api-token aren't configured
        // on this environment) in err.error.detail — showing only a generic
        // message here made this failure mode undiagnosable from the UI.
        const detail = err?.error?.detail;
        this.uploadError = detail ? `Upload failed: ${detail}` : 'Upload failed — try again';
      }
    });
  }

  removePhoto(): void {
    this.uploadedPhoto = null;
    this.uploadError = null;
  }

  get canPost(): boolean {
    return !this.posting && !this.uploading && this.draftContent.trim().length > 0;
  }

  submitPost(): void {
    if (!this.canPost) return;

    this.posting = true;
    this.postService.addPost({
      content: this.draftContent.trim(),
      photo: this.uploadedPhoto ? { photoUrl: this.uploadedPhoto.photoUrl, strapiId: this.uploadedPhoto.strapiId } : null,
    }).subscribe({
      next: res => {
        this.posting = false;
        const post = res.data;
        if (post) {
          this.myPosts = [post, ...this.myPosts];
          if (this.tab === 'feed') { this.feedPosts = [post, ...this.feedPosts]; }
        }
        this.draftContent = '';
        this.uploadedPhoto = null;
        this.snackBarService.openSnackBar('Posted', '');
      },
      error: () => {
        this.posting = false;
        this.snackBarService.openSnackBar('Could not post — try again', 'error');
      },
    });
  }

  // ── Feed actions ─────────────────────────────────────────────────────────

  isMine(post: PostResponse): boolean {
    return this.currentUserId != null && post.authorId === this.currentUserId;
  }

  /** Post cards only ever rendered a static icon -- PostResponse had no author photo field until now. */
  authorPhotoSrc(post: PostResponse): string | null {
    return post.authorPhoto ? 'data:image/*;base64,' + post.authorPhoto : null;
  }

  openLightbox(post: PostResponse): void {
    if (!post.photoUrl) return;
    this.expandedPost = post;
  }

  closeLightbox(): void {
    this.expandedPost = null;
  }

  toggleLike(post: PostResponse): void {
    const wasLiked = post.likedByMe;
    post.likedByMe = !wasLiked;
    post.likes += wasLiked ? -1 : 1;

    this.postService.toggleLike(post.id).subscribe({
      next: res => {
        const updated = res.data;
        if (!updated) return;
        this.applyToBothLists(updated);
      },
      error: () => {
        post.likedByMe = wasLiked;
        post.likes += wasLiked ? 1 : -1;
        this.snackBarService.openSnackBar('Could not update like', 'error');
      },
    });
  }

  deletePost(post: PostResponse): void {
    if (!confirm('Delete this post?')) return;

    this.postService.deletePost(post.id).subscribe({
      next: () => {
        this.myPosts = this.myPosts.filter(p => p.id !== post.id);
        this.feedPosts = this.feedPosts.filter(p => p.id !== post.id);
        this.snackBarService.openSnackBar('Post deleted', '');
      },
      error: () => this.snackBarService.openSnackBar('Could not delete post', 'error'),
    });
  }

  private applyToBothLists(updated: PostResponse): void {
    const applyTo = (list: PostResponse[]) => {
      const idx = list.findIndex(p => p.id === updated.id);
      if (idx > -1) list[idx] = updated;
    };
    applyTo(this.feedPosts);
    applyTo(this.myPosts);
  }

  trackByPostId(_: number, post: PostResponse): number {
    return post.id;
  }

  // ── Comments ─────────────────────────────────────────────────────────────

  commentsFor(post: PostResponse): CommentResponse[] {
    return this.commentsByPostId[post.id] ?? [];
  }

  toggleComments(post: PostResponse): void {
    if (this.openCommentsPostId === post.id) {
      this.openCommentsPostId = null;
      return;
    }
    this.openCommentsPostId = post.id;
    if (!this.commentsByPostId[post.id]) {
      this.loadComments(post.id);
    }
  }

  private loadComments(postId: number): void {
    this.loadingCommentsPostId = postId;
    this.commentService.getComments(postId).subscribe({
      next: res => {
        this.loadingCommentsPostId = null;
        this.commentsByPostId[postId] = res.data ?? [];
      },
      error: () => {
        this.loadingCommentsPostId = null;
        this.snackBarService.openSnackBar('Could not load comments', 'error');
      },
    });
  }

  submitComment(post: PostResponse): void {
    const content = (this.commentDraft[post.id] ?? '').trim();
    if (!content || this.postingComment[post.id]) return;

    this.postingComment[post.id] = true;
    this.commentService.addComment({ postId: post.id, content }).subscribe({
      next: res => {
        this.postingComment[post.id] = false;
        const comment = res.data;
        if (!comment) return;
        this.commentsByPostId[post.id] = [...this.commentsFor(post), comment];
        this.commentDraft[post.id] = '';
        post.commentCount = (post.commentCount ?? 0) + 1;
      },
      error: () => {
        this.postingComment[post.id] = false;
        this.snackBarService.openSnackBar('Could not post comment — try again', 'error');
      },
    });
  }

  deleteComment(post: PostResponse, comment: CommentResponse): void {
    if (!confirm('Delete this comment?')) return;

    this.commentService.deleteComment(comment.id).subscribe({
      next: () => {
        this.commentsByPostId[post.id] = this.commentsFor(post).filter(c => c.id !== comment.id);
        post.commentCount = Math.max(0, (post.commentCount ?? 1) - 1);
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
