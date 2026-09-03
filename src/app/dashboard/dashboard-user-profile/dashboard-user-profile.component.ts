import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PostCommentsComponent } from 'src/app/shared/post-comments/post-comments.component';
import { Connection } from 'src/app/models/connection.model';
import { PostResponse } from 'src/app/models/post.interface';
import { PublicUserProfile } from 'src/app/models/users.interface';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PhotoLightboxService } from 'src/app/services/photo-lightbox.service';
import { BlockService } from 'src/app/services/block.service';
import { BlockedUser } from 'src/app/models/block.model';

import * as ConnectionActions from 'src/app/state/connection/connection.actions';
import {
  selectMyConnections,
  selectPendingRequests,
} from 'src/app/state/connection/connection.selectors';
import {
  clearPublicProfile,
  loadPublicProfile,
  loadPublicProfileByUsername,
} from 'src/app/state/user-profile/user-profile.actions';
import {
  selectPublicProfile,
  selectPublicProfileLoading,
} from 'src/app/state/user-profile/user-profile.selector';

type ConnectStatus = 'self' | 'none' | 'incoming' | 'outgoing' | 'connected';

/**
 * Dashboard-native "view someone's profile + timeline" — `/dashboard/user/:username`.
 *
 * Reuses the same `loadPublicProfile*`/`PublicUserProfile` NgRx slice the public
 * `/user/:username` page uses (identity, bio, workouts), reuses the Connections
 * state for the connect/accept/cancel/message actions, and adds the one thing
 * neither of those pages has: the person's posts, via the `/post/timeline`
 * endpoint (fetched once the numeric id is known from the resolved profile).
 * Light dashboard theme throughout — this is the page Members and Connections
 * link to instead of ever sending a signed-in user to `/user/:username`.
 */
@Component({
  selector: 'app-dashboard-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule, SharedModule, PostCommentsComponent],
  templateUrl: './dashboard-user-profile.component.html'
})
export class DashboardUserProfileComponent implements OnInit, OnDestroy {

  profile: PublicUserProfile | null = null;
  loading = false;

  posts: PostResponse[] = [];
  postsLoading = false;

  connections: Connection[] = [];
  pendingRequests: Connection[] = [];
  private currentUserId: number | null = null;
  private userId: number | null = null;

  /** Which post's comment thread (PostCommentsComponent) is expanded inline, if any. Only one open at a time. */
  openCommentsPostId: number | null = null;

  blockedUsers: BlockedUser[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private postService: PostService,
    private snackBarService: SnackBarService,
    public lightbox: PhotoLightboxService,
    private blockService: BlockService,
  ) {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  ngOnInit(): void {
    this.store.dispatch(ConnectionActions.loadPendingRequests());
    this.store.dispatch(ConnectionActions.loadMyConnections());
    this.blockService.getBlockedUsers().subscribe(res => this.blockedUsers = res.data ?? []);

    this.store.select(selectMyConnections).pipe(takeUntil(this.destroy$)).subscribe(l => this.connections = l);
    this.store.select(selectPendingRequests).pipe(takeUntil(this.destroy$)).subscribe(l => this.pendingRequests = l);

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const username = params.get('username');
        if (!username) { return; }
        // Reset so a fast link-to-link navigation never fetches the timeline
        // for the previous person under the new username.
        this.userId = null;
        this.posts = [];
        // Some callers (admin tables, user-hover-card) link here by numeric id
        // rather than username. A purely numeric segment is never a real
        // username, so route it through the by-id lookup instead.
        const asId = Number(username);
        if (username.trim() !== '' && Number.isInteger(asId) && String(asId) === username.trim()) {
          this.store.dispatch(loadPublicProfile({ id: asId }));
        } else {
          this.store.dispatch(loadPublicProfileByUsername({ username }));
        }
      });

    this.store.select(selectPublicProfile).pipe(takeUntil(this.destroy$)).subscribe(profile => {
      this.profile = profile;
      // The route only carries a username; the numeric id (needed for the
      // timeline fetch and connect-status checks) only exists once the
      // profile itself resolves.
      if (profile && profile.id !== this.userId) {
        this.userId = profile.id;
        this.fetchTimeline(profile.id);
      }
    });
    this.store.select(selectPublicProfileLoading).pipe(takeUntil(this.destroy$)).subscribe(loading => this.loading = loading);
  }

  ngOnDestroy(): void {
    this.store.dispatch(clearPublicProfile());
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchTimeline(id: number): void {
    this.postsLoading = true;
    this.postService.getUserTimeline(id).subscribe({
      next: res => { this.posts = res.data ?? []; this.postsLoading = false; },
      error: () => { this.postsLoading = false; },
    });
  }

  refresh(): void {
    if (this.userId) { this.fetchTimeline(this.userId); }
  }

  // -------------------------
  // DERIVED VIEW STATE
  // -------------------------

  get notFound(): boolean {
    return !this.loading && !this.profile;
  }

  get isPrivate(): boolean {
    return !!this.profile?.isPrivate;
  }

  /** Berliz's super admin viewing a private profile anyway -- the content
   *  block below is populated even though isPrivate stays true. */
  get viewedAsAdminOverride(): boolean {
    return !!this.profile?.viewedAsAdminOverride;
  }

  get isSelf(): boolean {
    return this.currentUserId != null && this.userId === this.currentUserId;
  }

  get fullName(): string {
    if (!this.profile) return '';
    return `${this.profile.firstname ?? ''} ${this.profile.lastname ?? ''}`.trim();
  }

  get photoSrc(): string {
    return this.profile?.profilePhoto
      ? 'data:image/*;base64,' + this.profile.profilePhoto
      : '../../../assets/icons/user.png';
  }

  get location(): string | null {
    if (!this.profile) return null;
    const parts = [this.profile.city, this.profile.country].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  }

  get connectStatus(): ConnectStatus {
    if (this.isSelf) return 'self';
    if (!this.userId) return 'none';
    if (this.connections.some(c => c.otherUserId === this.userId)) return 'connected';
    const pending = this.pendingRequests.find(c => c.otherUserId === this.userId);
    if (pending) return pending.direction === 'incoming' ? 'incoming' : 'outgoing';
    return 'none';
  }

  private pendingRequestFor(): Connection | undefined {
    return this.pendingRequests.find(c => c.otherUserId === this.userId);
  }

  sendRequest(): void {
    if (!this.userId) return;
    this.store.dispatch(ConnectionActions.sendConnectionRequest({ recipientId: this.userId }));
  }

  cancelRequest(): void {
    const request = this.pendingRequestFor();
    if (request) this.store.dispatch(ConnectionActions.cancelConnectionRequest({ id: request.id }));
  }

  acceptRequest(): void {
    const request = this.pendingRequestFor();
    if (request) this.store.dispatch(ConnectionActions.respondToConnectionRequest({ id: request.id, status: 'accepted' }));
  }

  message(): void {
    this.router.navigate(['/dashboard/messages']);
  }

  get isBlocked(): boolean {
    return this.userId != null && this.blockedUsers.some(b => b.blockedUserId === this.userId);
  }

  toggleBlock(): void {
    if (!this.userId) return;

    if (this.isBlocked) {
      if (!confirm(`Unblock ${this.fullName}?`)) return;
      const id = this.userId;
      this.blockService.unblockUser(id).subscribe({
        next: () => {
          this.blockedUsers = this.blockedUsers.filter(b => b.blockedUserId !== id);
          this.snackBarService.openSnackBar('Unblocked', '');
        },
        error: () => this.snackBarService.openSnackBar('Could not unblock', 'error'),
      });
    } else {
      if (!confirm(`Block ${this.fullName}? They won't be able to message you, mention you, or comment on your posts.`)) return;
      this.blockService.blockUser(this.userId).subscribe({
        next: res => {
          if (res.data) this.blockedUsers = [...this.blockedUsers, res.data];
          this.snackBarService.openSnackBar(res.data?.message || 'Blocked', '');
        },
        error: err => this.snackBarService.openSnackBar(err.error?.message || 'Could not block', 'error'),
      });
    }
  }

  // -------------------------
  // TIMELINE
  // -------------------------

  toggleLike(post: PostResponse): void {
    // Optimistic flip so the like feels instant; corrected by the server response.
    const wasLiked = post.likedByMe;
    post.likedByMe = !wasLiked;
    post.likes += wasLiked ? -1 : 1;

    this.postService.toggleLike(post.id).subscribe({
      next: res => {
        const updated = res.data;
        if (!updated) return;
        const idx = this.posts.findIndex(p => p.id === updated.id);
        if (idx > -1) this.posts[idx] = updated;
      },
      error: () => {
        // Roll back on failure.
        post.likedByMe = wasLiked;
        post.likes += wasLiked ? 1 : -1;
        this.snackBarService.openSnackBar('Could not update like', 'error');
      },
    });
  }

  trackByPostId(_: number, post: PostResponse): number {
    return post.id;
  }

  toggleComments(post: PostResponse): void {
    this.openCommentsPostId = this.openCommentsPostId === post.id ? null : post.id;
  }
}
