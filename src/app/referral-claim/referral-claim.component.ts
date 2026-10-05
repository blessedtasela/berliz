import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { ReferralEligibleProvider, ReferralSlotOption, ReferralWaitlistStatus } from 'src/app/models/referral-claim.model';
import { ReferralClaimService } from 'src/app/services/referral-claim.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Turns a referral SessionCredit into a real, bookable session instead of
 * the old "show this to your trainer/center" badge -- lists opted-in
 * providers with real open slots and books the exact one picked; when
 * nobody currently has room, offers the waitlist instead (see
 * ReferralWaitlistScheduler on the backend for how that gets resolved).
 */
@Component({
    selector: 'app-referral-claim',
    imports: [CommonModule, RouterModule, IconsModule],
    templateUrl: './referral-claim.component.html'
})
export class ReferralClaimComponent implements OnInit {

  sessionCreditId!: number;
  providers: ReferralEligibleProvider[] = [];
  loading = true;
  claimingKey: string | null = null;

  waitlist: ReferralWaitlistStatus | null = null;
  joiningWaitlist = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private referralClaimService: ReferralClaimService,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.sessionCreditId = Number(this.route.snapshot.paramMap.get('sessionCreditId'));
    this.loadEligibleProviders();
  }

  loadEligibleProviders(): void {
    this.loading = true;
    this.referralClaimService.getEligibleProviders(this.sessionCreditId)
      .pipe(take(1))
      .subscribe({
        next: res => { this.providers = res?.data ?? []; this.loading = false; },
        error: err => {
          this.loading = false;
          this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
        },
      });
  }

  slotKey(provider: ReferralEligibleProvider, slot: ReferralSlotOption): string {
    return `${provider.trainerId ?? 'c' + provider.centerId}-${slot.date}-${slot.startTime}`;
  }

  claim(provider: ReferralEligibleProvider, slot: ReferralSlotOption): void {
    if (this.claimingKey) return;
    this.claimingKey = this.slotKey(provider, slot);

    this.referralClaimService.claimSlot({
      sessionCreditId: this.sessionCreditId,
      trainerId: provider.trainerId,
      centerId: provider.centerId,
      date: slot.date,
      startTime: slot.startTime,
    }).pipe(take(1)).subscribe({
      next: res => {
        this.claimingKey = null;
        this.snackBar.openSnackBar(res?.data?.message || res?.message || 'Session booked -- the provider will confirm shortly.', '');
        this.router.navigate(['/dashboard/my-bookings']);
      },
      error: err => {
        this.claimingKey = null;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
        // The slot was likely just taken by someone else -- refresh the list.
        this.loadEligibleProviders();
      },
    });
  }

  joinWaitlist(): void {
    if (this.joiningWaitlist) return;
    this.joiningWaitlist = true;

    this.referralClaimService.joinWaitlist(this.sessionCreditId)
      .pipe(take(1))
      .subscribe({
        next: res => {
          this.joiningWaitlist = false;
          this.waitlist = res?.data ?? null;
          this.snackBar.openSnackBar(res?.data?.message || 'Added to the waitlist', '');
        },
        error: err => {
          this.joiningWaitlist = false;
          this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
        },
      });
  }
}
