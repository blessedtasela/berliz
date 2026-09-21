import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { SessionCreditService } from 'src/app/services/session-credit.service';
import { ReferralService } from 'src/app/services/referral.service';
import { PromotionService } from 'src/app/services/promotion.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SessionCredit, ReferralStats, ReferralLeaderboardEntry } from 'src/app/models/promo-offer.model';
import { genericError } from 'src/validators/form-validators.module';

/**
 * "My Rewards" -- free-session/discount credits earned from platform
 * campaigns or referrals, plus the referral share link itself. Available to
 * every role; a client and a trainer both refer friends the same way.
 */
@Component({
  selector: 'app-my-rewards',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './my-rewards.component.html',
  styleUrls: ['./my-rewards.component.css']
})
export class MyRewardsComponent implements OnInit {

  credits: SessionCredit[] = [];
  loading = true;

  stats: ReferralStats | null = null;
  statsLoading = true;
  copied = false;
  claimingBonus = false;

  leaderboard: ReferralLeaderboardEntry[] = [];
  leaderboardLoading = true;

  redeemCodeInput = '';
  redeeming = false;

  constructor(
    private sessionCreditService: SessionCreditService,
    private referralService: ReferralService,
    private promotionService: PromotionService,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.loadCredits();
    this.loadStats();
    this.loadLeaderboard();
  }

  private loadCredits(): void {
    this.loading = true;
    this.sessionCreditService.getMine().pipe(take(1)).subscribe({
      next: (res) => { this.credits = res?.data ?? []; this.loading = false; },
      error: () => { this.loading = false; this.snackBar.openSnackBar(genericError, 'error'); }
    });
  }

  private loadStats(): void {
    this.statsLoading = true;
    this.referralService.getMyStats().pipe(take(1)).subscribe({
      next: (res) => { this.stats = res?.data ?? null; this.statsLoading = false; },
      error: () => { this.statsLoading = false; }
    });
  }

  private loadLeaderboard(): void {
    this.leaderboardLoading = true;
    this.referralService.getLeaderboard().pipe(take(1)).subscribe({
      next: (res) => { this.leaderboard = res?.data ?? []; this.leaderboardLoading = false; },
      error: () => { this.leaderboardLoading = false; }
    });
  }

  get available(): SessionCredit[] {
    return this.credits.filter(c => c.status === 'available');
  }

  get used(): SessionCredit[] {
    return this.credits.filter(c => c.status !== 'available');
  }

  get referralLink(): string {
    if (!this.stats?.referrerId) return '';
    return `${window.location.origin}/sign-up?ref=${this.stats.referrerId}`;
  }

  get hasShareBonus(): boolean {
    return this.credits.some(c => c.reason === 'share_bonus');
  }

  creditLabel(c: SessionCredit): string {
    switch (c.type) {
      case 'free_session': return 'Free session';
      case 'percentage': return `${c.value ?? ''}% off`;
      case 'fixed': return `$${c.value ?? ''} off`;
      default: return 'Reward';
    }
  }

  copyLink(): void {
    if (!this.referralLink) return;
    navigator.clipboard?.writeText(this.referralLink).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }

  /** Opens the device's native share sheet when available, falling back to copying the link -- either way counts as "shared" for the one-time bonus. */
  shareLink(): void {
    if (!this.referralLink) return;

    const shareData = { title: 'Join me on Berliz', text: 'Train with me on Berliz -- sign up with my link:', url: this.referralLink };
    const afterShare = () => this.claimShareBonus();

    if (navigator.share) {
      navigator.share(shareData).then(afterShare).catch(() => { /* user cancelled -- no bonus */ });
    } else {
      this.copyLink();
      afterShare();
    }
  }

  private claimShareBonus(): void {
    if (this.claimingBonus || this.hasShareBonus) return;
    this.claimingBonus = true;
    this.referralService.claimShareBonus().pipe(take(1)).subscribe({
      next: (res) => {
        this.claimingBonus = false;
        this.snackBar.openSnackBar(res?.data || res?.message || 'Thanks for sharing', '');
        this.loadCredits();
      },
      error: (err: any) => {
        this.claimingBonus = false;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      }
    });
  }

  redeemCode(): void {
    const code = this.redeemCodeInput.trim();
    if (!code || this.redeeming) return;

    this.redeeming = true;
    this.promotionService.redeemCode(code).pipe(take(1)).subscribe({
      next: (res: any) => {
        this.redeeming = false;
        this.redeemCodeInput = '';
        this.snackBar.openSnackBar(res?.message || res?.data?.message || 'Code redeemed', '');
        this.loadCredits();
      },
      error: (err: any) => {
        this.redeeming = false;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      }
    });
  }
}
