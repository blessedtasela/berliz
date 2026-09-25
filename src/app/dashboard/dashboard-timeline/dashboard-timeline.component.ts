import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PostCommentsComponent } from 'src/app/shared/post-comments/post-comments.component';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { LikersModalComponent } from 'src/app/shared/likers-modal/likers-modal.component';
import { PostDetailSheetComponent } from 'src/app/shared/post-detail-sheet/post-detail-sheet.component';
import { ReactionButtonComponent } from 'src/app/shared/reaction-button/reaction-button.component';
import { BookProviderButtonComponent } from 'src/app/shared/book-provider-button/book-provider-button.component';
import { PostActivityType, PostResponse, ReactionType } from 'src/app/models/post.interface';
import { memoizePhotoUriByKey, photoDataUri } from 'src/app/shared/photo-lightbox/photo-data-uri';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { UserService } from 'src/app/services/user.service';
import { ContentReportService } from 'src/app/services/content-report.service';
import { WorkoutService } from 'src/app/services/workout.service';
import { WorkoutResponse } from 'src/app/models/workout.interface';
import { SavedService } from 'src/app/services/saved.service';
import { DraftService } from 'src/app/services/draft.service';
import { DraftEntry } from 'src/app/models/draft.model';
import { DraftResumeBannerComponent } from 'src/app/shared/draft-resume-banner/draft-resume-banner.component';
import { imageValidator } from 'src/validators/form-validators.module';

/** Everything DraftService needs to fully restore the composer — see PostDraftData below. */
interface PostDraftData {
  content: string;
  activityType: PostActivityType;
  workoutId: number | null;
  uploadedPhoto: { strapiId: number; photoUrl: string } | null;
}

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
  { value: 'WORKOUT', label: 'Workout', icon: 'zap', tone: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900' },
  { value: 'SESSION', label: 'Completed session', icon: 'check-circle', tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900' },
  { value: 'PROGRESS', label: 'Progress', icon: 'trending-up', tone: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900' },
  { value: 'MILESTONE', label: 'Milestone', icon: 'award', tone: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900' },
  { value: 'TESTIMONIAL', label: 'Testimonial', icon: 'message-square', tone: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900' },
  { value: 'REVIEW', label: 'Review', icon: 'star', tone: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900' },
];

@Component({
  selector: 'app-dashboard-timeline',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconsModule, SharedModule, MatDialogModule, PostCommentsComponent, PostDetailSheetComponent, ReactionButtonComponent, BookProviderButtonComponent, DraftResumeBannerComponent],
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
  // No backend-enforced cap exists on post content (TEXT column, no @Size
  // validation) -- this is a client-side guard against unbounded payloads,
  // not a substitute for one.
  readonly maxContentLength = 5000;
  draftActivityType: PostActivityType = 'GENERAL';
  /** Optional workout template attached to a WORKOUT-type draft. */
  draftWorkoutId: number | null = null;
  myTemplates: WorkoutResponse[] = [];
  /** The post whose linked template is currently being cloned. */
  cloningWorkoutPostId: number | null = null;
  posting = false;
  uploadedPhoto: { strapiId: number; photoUrl: string } | null = null;
  uploading = false;
  uploadError: string | null = null;

  /** Set on init when a previous session left the composer mid-draft — shows the resume banner rather than silently restoring or losing it. */
  pendingDraft: DraftEntry<PostDraftData> | null = null;

  // ── Read view ────────────────────────────────────────────────────────────
  /** Posts whose long text the reader has expanded past the 5-line clamp. */
  private readonly expandedPosts = new Set<number>();
  /** The post whose media + comments sheet is open, if any. */
  sheetPost: PostResponse | null = null;

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
    private workoutService: WorkoutService,
    public saved: SavedService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private draftService: DraftService,
  ) {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  ngOnInit(): void {
    this.refresh();
    this.saved.refresh();
    this.openPostFromQueryParam();
    this.pendingDraft = this.draftService.get<PostDraftData>('post');
    this.workoutService.getTemplates().subscribe({
      next: res => this.myTemplates = res.data ?? [],
      error: () => { /* the picker just stays empty */ },
    });
    this.userService.getUser().subscribe({
      next: res => {
        const photo = res.data?.profilePhoto;
        if (photo) { this.myPhotoSrc = photoDataUri(photo) ?? this.myPhotoSrc; }
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

  /** "Continue" on the resume banner -- applies the saved draft's fields to the live composer. */
  resumeDraft(): void {
    if (!this.pendingDraft) return;
    const d = this.pendingDraft.data;
    this.draftContent = d.content;
    this.draftActivityType = d.activityType;
    this.draftWorkoutId = d.workoutId;
    this.uploadedPhoto = d.uploadedPhoto;
    this.pendingDraft = null;
  }

  /** "Start fresh" on the resume banner -- throws the saved draft away, leaves the (already-empty) composer as-is. */
  discardPendingDraft(): void {
    this.draftService.discard('post');
    this.pendingDraft = null;
  }

  /** Called on every composer edit. Autosaves a non-empty draft; clears any saved draft once the composer is genuinely empty again. */
  saveDraft(): void {
    const hasContent = this.draftContent.trim().length > 0 || !!this.uploadedPhoto || this.draftActivityType !== 'GENERAL';
    if (!hasContent) {
      this.draftService.discard('post');
      return;
    }
    this.draftService.save<PostDraftData>('post', {
      content: this.draftContent,
      activityType: this.draftActivityType,
      workoutId: this.draftWorkoutId,
      uploadedPhoto: this.uploadedPhoto,
    }, {
      label: 'Post',
      preview: this.draftContent.trim().slice(0, 120) || undefined,
      route: '/dashboard/timeline',
    });
  }

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
        this.saveDraft();
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
    this.saveDraft();
  }

  get canPost(): boolean {
    return !this.posting && !this.uploading && this.draftContent.trim().length > 0;
  }

  setActivityType(type: PostActivityType): void {
    // Tapping the active chip again clears it back to a plain post.
    this.draftActivityType = this.draftActivityType === type ? 'GENERAL' : type;
    this.saveDraft();
  }

  submitPost(): void {
    if (!this.canPost) return;

    this.posting = true;
    this.postService.addPost({
      content: this.draftContent.trim(),
      activityType: this.draftActivityType === 'GENERAL' ? undefined : this.draftActivityType,
      photo: this.uploadedPhoto ? { photoUrl: this.uploadedPhoto.photoUrl, strapiId: this.uploadedPhoto.strapiId } : null,
      workoutId: this.draftActivityType === 'WORKOUT' && this.draftWorkoutId ? this.draftWorkoutId : undefined,
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
        this.draftWorkoutId = null;
        this.uploadedPhoto = null;
        this.draftService.discard('post');
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

  private readonly _authorUri = memoizePhotoUriByKey();

  /** Post cards only ever rendered a static icon -- PostResponse had no author photo field until now. */
  authorPhotoSrc(post: PostResponse): string | null {
    return this._authorUri(post.id, post.authorPhoto);
  }

  /** Add / switch / remove the viewer's reaction on a post. Optimistic; server reconciles. */
  onReact(post: PostResponse, reaction: ReactionType): void {
    const prev = { reaction: post.myReaction ?? null, count: post.likes, liked: post.likedByMe };

    if (prev.reaction === reaction) {
      post.myReaction = null;
      post.likedByMe = false;
      post.likes = Math.max(0, prev.count - 1);
    } else {
      post.myReaction = reaction;
      post.likedByMe = true;
      post.likes = prev.reaction ? prev.count : prev.count + 1;
    }

    this.postService.toggleLike(post.id, reaction).subscribe({
      next: res => {
        if (res.data) this.applyToBothLists(res.data);
      },
      error: () => {
        post.myReaction = prev.reaction;
        post.likedByMe = prev.liked;
        post.likes = prev.count;
        this.snackBarService.openSnackBar('Could not update reaction', 'error');
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

  /** Opens the media + comments bottom sheet for a post. */
  openPostSheet(post: PostResponse): void {
    this.sheetPost = post;
  }

  /**
   * Notification bell deep link -- ?postId=<id> lands here from a "commented
   * on your post" / "mentioned you" / "replied to your comment" notification.
   * Fetched independently rather than found in feedPosts/myPosts: the post
   * might belong to a connection and not be on whichever tab is active (or
   * not loaded yet at all), and this is the one case that needs the exact
   * post regardless of tab. The query param is cleared after so a reload
   * doesn't reopen the sheet.
   */
  private openPostFromQueryParam(): void {
    const postId = Number(this.route.snapshot.queryParamMap.get('postId'));
    if (!postId) return;

    this.postService.getPostById(postId).subscribe({
      next: res => {
        if (res.data) this.openPostSheet(res.data);
        this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
      },
      error: () => {
        this.snackBarService.openSnackBar('That post is no longer available', 'error');
        this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
      },
    });
  }

  /** Clone the workout template linked on a post into the viewer's own workouts. */
  addWorkoutFromPost(post: PostResponse): void {
    if (!post.workoutId || this.cloningWorkoutPostId === post.id) return;
    this.cloningWorkoutPostId = post.id;
    this.workoutService.cloneTemplate(post.workoutId).subscribe({
      next: () => {
        this.cloningWorkoutPostId = null;
        this.snackBarService.openSnackBar('Added to your workouts', '');
      },
      error: err => {
        this.cloningWorkoutPostId = null;
        this.snackBarService.openSnackBar(err?.error?.message || 'Could not add this workout', 'error');
      },
    });
  }
}
