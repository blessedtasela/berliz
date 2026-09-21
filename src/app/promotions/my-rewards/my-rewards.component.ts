import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { SessionCreditService } from 'src/app/services/session-credit.service';
import { ReferralService } from 'src/app/services/referral.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SessionCredit, ReferralStats } from 'src/app/models/promo-offer.model';
import { genericError } from 'src/validators/form-validators.module';

/**
 * "My Rewards" -- free-session/discount credits earned from platform
 * campaigns or referrals, plus the referral share link itself. Available to
 * every role; a client and a trainer both refer friends the same way.
 */
@Component({
  selector: 'app-my-rewards',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './my-rewards.component.html',
  styleUrls: ['./my-rewards.component.css']
})
export class MyRewardsComponent implements OnInit {

  credits: SessionCredit[] = [];
  loading = true;

  stats: ReferralStats | null = null;
  statsLoading = true;
  copied = false;

  constructor(
    private sessionCreditService: SessionCreditService,
    private referralService: ReferralService,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.loadCredits();
    this.loadStats();
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
}
