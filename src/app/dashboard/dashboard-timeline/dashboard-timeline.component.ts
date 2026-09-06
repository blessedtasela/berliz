import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PostCommentsComponent } from 'src/app/shared/post-comments/post-comments.component';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { LikersModalComponent } from 'src/app/shared/likers-modal/likers-modal.component';
import { PostMediaViewerComponent } from './post-media-viewer.component';
import { PostActivityType, PostResponse } from 'src/app/models/post.interface';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { UserService } from 'src/app/services/user.service';
import { ContentReportService } from 'src/app/services/content-report.service';
import { imageValidator } from 'src/validators/form-validators.module';

type TimelineTab = 'feed' | 'mine';

/**
 * Compose + view your own posts, and see your accepted connections' posts —
 * `/dashboard/timeline`. Defaults to the Feed tab; toggles to "My Timeline"
 * for just your own posts. Reads from PostService directly (no NgRx slice:
 * the only consumer of this state is this one page, plus the read-only
 * viewer on DashboardUserProfileComponent which fetches its own copy
 * independently). Comment threads are PostCommentsComponent, shared with
 * both profile pages' Timeline sections.
 */
/** Activity a post can be framed as. GENERAL is the plain-post default and isn't shown as a chip. */
interface ActivityOption {
  value: Exclude<PostActivityType, 'GENERAL'>;
  label: string;
  icon: string;
  /** Tailwind classes for the badge/chip (text + subtle bg + border). */
  tone: string;
}

const ACTIVITY_OPTIONS: ActivityOption[] = [
  { value: 'WORKOUT', label: 'Workout', icon: 'zap', tone: 'text-orange-600 bg-orange-50 border-orange-100' },
  { value: 'SESSION', label: 'Completed session', icon: 'check-circle', tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { value: 'PROGRESS', label: 'Progress', icon: 'trending-up', tone: 'text-sky-600 bg-sky-50 border-sky-100' },
  { value: 'MILESTONE', label: 'Milestone', icon: 'award', tone: 'text-violet-600 bg-violet-50 border-violet-100' },
  { value: 'TESTIMONIAL', label: 'Testimonial', icon: 'message-square', tone: 'text-rose-600 bg-rose-50 border-rose-100' },
  { value: 'REVIEW', label: 'Review', icon: 'star', tone: 'text-amber-600 bg-amber-50 border-amber-100' },
];

@Component({
  selector: 'app-dashboard-timeline',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconsModule, SharedModule, MatDialogModule, PostCommentsComponent, PostMediaViewerComponent],
  templateUrl: './dashboard-timeline.component.html'
})
export class DashboardTimelineComponent implements OnInit, OnDestroy {

  readonly activityOptions = ACTIVITY_OPTIONS;

  tab: TimelineTab = 'feed';

  feedPosts: PostResponse[] = [];
  myPosts: PostResponse[] = [];
  loading = false;

  // ── Compose ──────────────────────────────────────────────────────────────
  draftContent = '';
  draftActivityType: PostActivityType = 'GENERAL';
  posting = false;
  uploadedPhoto: { strapiId: number; photoUrl: string } | null = null;
  uploading = false;
  uploadError: string | null = null;

  // ── Read view ────────────────────────────────────────────────────────────
  /** Posts whose long text the reader has expanded past the 5-line clamp. */
  private readonly expandedPosts = new Set<number>();
  /** The post whose media is open in the full-screen viewer, if any. */
  viewerPost: PostResponse | null = null;

  currentUserId: number | null = null;
  myPhotoSrc = '../../../assets/icons/user.png';

  /** Which post's comment thread (PostCommentsComponent) is expanded inline, if any. Only one open at a time. */
  openCommentsPostId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private postService: PostService,
    private strapiService: StrapiService,
    private authService: AuthService,
    private userService: UserService,
    private snackBarService: SnackBarService,
    private contentReportService: ContentReportService,
    private dialog: MatDialog,
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

  setActivityType(type: PostActivityType): void {
    // Tapping the active chip again clears it back to a plain post.
    this.draftActivityType = this.draftActivityType === type ? 'GENERAL' : type;
  }

  submitPost(): void {
    if (!this.canPost) return;

    this.posting = true;
    this.postService.addPost({
      content: this.draftContent.trim(),
      activityType: this.draftActivityType === 'GENERAL' ? undefined : this.draftActivityType,
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
        this.draftActivityType = 'GENERAL';
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

  /** Opens the "liked by" list for a post. */
  openPostLikers(post: PostResponse): void {
    this.dialog.open(LikersModalComponent, {
      width: '380px',
      maxWidth: '95vw',
      data: { kind: 'post', id: post.id, routePrefix: '/dashboard/user' },
    });
  }

  deletePost(post: PostResponse): void {
    this.dialog.open(PromptModalComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Delete this post?',
        message: 'This will permanently remove the post from your timeline.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        icon: 'trash-2'
      }
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.postService.deletePost(post.id).subscribe({
        next: () => {
          this.myPosts = this.myPosts.filter(p => p.id !== post.id);
          this.feedPosts = this.feedPosts.filter(p => p.id !== post.id);
          this.snackBarService.openSnackBar('Post deleted', '');
        },
        error: () => this.snackBarService.openSnackBar('Could not delete post', 'error'),
      });
    });
  }

  /** Native prompt for the optional reason -- matches this component's existing use of confirm() for delete; a less-frequent secondary action than commenting, so it doesn't need PostCommentsComponent's inline report form treatment. */
  reportPost(post: PostResponse): void {
    const reason = window.prompt('Why are you reporting this post? (optional)');
    if (reason === null) return; // cancelled

    this.contentReportService.addReport({ targetType: 'post', targetId: post.id, reason: reason.trim() || undefined }).subscribe({
      next: res => this.snackBarService.openSnackBar(res.data?.message || 'Report submitted', ''),
      error: err => this.snackBarService.openSnackBar(err.error?.message || 'Could not submit report', 'error'),
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

  toggleComments(post: PostResponse): void {
    this.openCommentsPostId = this.openCommentsPostId === post.id ? null : post.id;
  }

  // ── Read view: activity badge, "see more", media lightbox ─────────────────

  /** The chip/badge metadata for a post's activity, or null for a plain (GENERAL) post. */
  activityMeta(post: PostResponse): ActivityOption | null {
    if (!post.activityType || post.activityType === 'GENERAL') return null;
    return this.activityOptions.find(o => o.value === post.activityType) ?? null;
  }

  /** True when the body is long enough that we clamp it to 5 lines and offer "See more". */
  isLongContent(post: PostResponse): boolean {
    const text = post.content ?? '';
    const lineBreaks = (text.match(/\n/g) ?? []).length;
    return lineBreaks >= 5 || text.length > 280;
  }

  isExpanded(post: PostResponse): boolean {
    return this.expandedPosts.has(post.id);
  }

  toggleExpanded(post: PostResponse): void {
    if (this.expandedPosts.has(post.id)) this.expandedPosts.delete(post.id);
    else this.expandedPosts.add(post.id);
  }

  openViewer(post: PostResponse): void {
    if (!post.photoUrl) return;
    this.viewerPost = post;
  }

  closeViewer(): void {
    this.viewerPost = null;
  }
}
