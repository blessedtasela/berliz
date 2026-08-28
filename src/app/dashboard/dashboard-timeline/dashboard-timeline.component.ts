import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PostResponse } from 'src/app/models/post.interface';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { UserService } from 'src/app/services/user.service';
import { imageValidator } from 'src/validators/form-validators.module';

type TimelineTab = 'feed' | 'mine';

/**
 * Compose + view your own posts, and see your accepted connections' posts —
 * `/dashboard/timeline`. Reads from PostService directly (no NgRx slice: the
 * only consumer of this state is this one page, plus the read-only viewer on
 * DashboardUserProfileComponent which fetches its own copy independently).
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

  private destroy$ = new Subject<void>();

  constructor(
    private postService: PostService,
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
      error: () => {
        this.uploading = false;
        this.uploadError = 'Upload failed — try again';
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
}
