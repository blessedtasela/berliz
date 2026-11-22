import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { IconsModule } from 'src/app/icons/icons.module';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileQuizService } from 'src/app/services/profile-quiz.service';

const DISMISSED_KEY = 'profileQuizPromptDismissed';

/**
 * A dismissible nudge on the feed ("Tell us about your goals") for anyone
 * signed in who hasn't finished the GN-75 profile quiz yet -- a soft prompt,
 * not a gate: dismissing it (localStorage, permanent) or just ignoring it
 * never blocks anything else in the app. Self-contained like
 * FollowButtonComponent -- drop it in, no wiring needed from the host page.
 */
@Component({
  selector: 'app-profile-quiz-prompt',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <div *ngIf="visible" class="flex items-center gap-3 rounded-xl border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-3">
      <div class="w-8 h-8 rounded-lg bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900 flex items-center justify-center shrink-0">
        <i-feather name="compass" class="text-red-600" style="width:14px;height:14px;"></i-feather>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-bold text-gray-900 dark:text-gray-100">Tell us about your goals</p>
        <p class="text-[11px] text-gray-500 dark:text-gray-400">5 quick questions to personalize your feed</p>
      </div>
      <a routerLink="/dashboard/hub/profile-quiz"
        class="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-600 text-white hover:bg-red-700 transition">
        Start
      </a>
      <button type="button" (click)="dismiss()" aria-label="Dismiss"
        class="shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">
        <i-feather name="x" style="width:14px;height:14px;"></i-feather>
      </button>
    </div>
  `
})
export class ProfileQuizPromptComponent implements OnInit {
  visible = false;

  constructor(
    private authService: AuthService,
    private profileQuizService: ProfileQuizService,
  ) { }

  ngOnInit(): void {
    if (!this.authService.hasSession() || this.wasDismissed()) return;

    this.profileQuizService.getStatus().subscribe({
      next: res => { this.visible = !!res.data && !res.data.completed; },
      error: () => { /* stay hidden -- a load failure here shouldn't put a broken card on the feed */ },
    });
  }

  dismiss(): void {
    this.visible = false;
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { /* best-effort only */ }
  }

  private wasDismissed(): boolean {
    try { return localStorage.getItem(DISMISSED_KEY) === '1'; } catch { return false; }
  }
}
