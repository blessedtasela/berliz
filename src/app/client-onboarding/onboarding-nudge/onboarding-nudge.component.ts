import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { catchError, of, take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { AuthService } from 'src/app/services/auth.service';
import { ClientOnboardingService } from 'src/app/services/client-onboarding.service';

/**
 * A soft prompt to finish onboarding, shown on the booking page. It never blocks: the booking goes through either
 * way (the trainer just sees an "onboarding incomplete" flag on the request). Renders nothing for a signed-out
 * visitor, a trainer, or a client whose onboarding is already complete.
 */
@Component({
  selector: 'app-onboarding-nudge',
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <div *ngIf="show" class="px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 flex items-start gap-2.5" data-testid="onboarding-nudge">
      <i-feather name="clipboard" class="text-blue-600 shrink-0 mt-0.5" style="width:14px;height:14px;"></i-feather>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold text-blue-900 dark:text-blue-200">Tell your trainer about you</p>
        <p class="text-[11px] text-blue-800 dark:text-blue-300">Your goals, schedule and any injuries help them plan your first session. It takes about 5 minutes, and you can book now and do it after.</p>
      </div>
      <a routerLink="/dashboard/onboarding" class="shrink-0 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:underline">{{ started ? 'Finish' : 'Start' }}</a>
    </div>
  `,
})
export class OnboardingNudgeComponent implements OnInit {
  show = false;
  started = false;

  constructor(private service: ClientOnboardingService, private auth: AuthService) { }

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) return;
    if ((this.auth.getCurrentUserRole() || '').toLowerCase() === 'trainer') return;
    this.service.getMine().pipe(take(1), catchError(() => of(null))).subscribe(o => {
      if (!o) return;
      this.started = o.started;
      this.show = !o.complete;
    });
  }
}
