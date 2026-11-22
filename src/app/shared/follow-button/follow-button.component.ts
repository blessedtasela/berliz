import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { AuthService } from 'src/app/services/auth.service';
import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { FollowService } from 'src/app/services/follow.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

/**
 * Follow / Following toggle for a trainer's public profile (and, later, the
 * home feed's recommended-trainers section) -- GN-75's real one-way follow,
 * separate from the mutual request/accept Connection. A signed-out visitor
 * is sent to /login rather than silently doing nothing; the component hides
 * itself entirely on a user's own profile, where following yourself makes no
 * sense.
 */
@Component({
  selector: 'app-follow-button',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <button *ngIf="!isSelf" type="button" (click)="toggle()" [disabled]="loading"
      class="px-6 py-3 rounded-xl text-sm font-semibold transition flex items-center gap-2 justify-center disabled:opacity-60 disabled:cursor-default"
      [ngClass]="following
        ? 'border border-red-600/60 bg-red-950/40 text-red-200 hover:border-red-500'
        : 'border border-zinc-700 text-zinc-200 hover:border-red-600 hover:text-white'">
      <i-feather [name]="following ? 'user-check' : 'user-plus'" style="width:14px;height:14px;"></i-feather>
      {{ following ? 'Following' : 'Follow' }}
    </button>
  `
})
export class FollowButtonComponent implements OnInit, OnChanges {
  @Input() userId: number | null = null;

  following = false;
  loading = false;

  constructor(
    private authService: AuthService,
    private authRedirect: AuthRedirectService,
    private followService: FollowService,
    private snackBarService: SnackBarService,
  ) { }

  get isSelf(): boolean {
    return this.userId != null && this.userId === this.authService.getCurrentUserId();
  }

  ngOnInit(): void {
    this.refreshStatus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId']) this.refreshStatus();
  }

  private refreshStatus(): void {
    if (!this.userId || this.isSelf || !this.authService.hasSession()) return;
    this.followService.isFollowing(this.userId).subscribe({
      next: res => this.following = !!res.data,
      error: () => { /* defaults to "not following" -- the toggle still works either way */ },
    });
  }

  toggle(): void {
    if (!this.authService.hasSession()) {
      this.authRedirect.goToLogin('follow');
      return;
    }
    if (!this.userId || this.loading) return;

    const wasFollowing = this.following;
    this.following = !wasFollowing;
    this.loading = true;

    const onSettled = {
      next: () => { this.loading = false; },
      error: () => {
        this.loading = false;
        this.following = wasFollowing;
        this.snackBarService.openSnackBar('Could not update follow status', 'error');
      },
    };
    if (wasFollowing) this.followService.unfollowUser(this.userId).subscribe(onSettled);
    else this.followService.followUser(this.userId).subscribe(onSettled);
  }
}
