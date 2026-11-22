import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { AuthService } from 'src/app/services/auth.service';

/**
 * GN-78: shown only while the super admin is acting as another account (AuthService.isImpersonating),
 * so there is always a visible, impossible-to-miss way back -- never something that quietly relies on
 * the admin remembering to sign back in separately. "Return to admin" restores the stashed admin
 * session and hard-reloads, the same way impersonation itself was started: every piece of client
 * state must read the restored identity fresh, not carry anything over from the impersonated one.
 */
@Component({
  selector: 'app-impersonation-banner',
  imports: [CommonModule, IconsModule],
  template: `
    <div *ngIf="impersonating" role="status"
         class="mb-4 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50 dark:bg-sky-950/30 px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans">
      <span class="flex items-center gap-2 text-xs text-sky-900 dark:text-sky-200 flex-1 min-w-[12rem]">
        <i-feather name="user-check" style="width:14px;height:14px;" class="shrink-0"></i-feather>
        <span><strong>Impersonating {{ email }}</strong> ({{ role }}). Anything you do happens as this account.</span>
      </span>
      <button type="button" (click)="returnToAdmin()"
              class="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition shrink-0">
        Return to admin
      </button>
    </div>
  `
})
export class ImpersonationBannerComponent implements OnInit {
  impersonating = false;
  email: string | null = null;
  role: string | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.impersonating = this.authService.isImpersonating();
    if (this.impersonating) {
      this.email = this.authService.getCurrentUserEmail();
      this.role = this.authService.getCurrentUserRole();
    }
  }

  returnToAdmin(): void {
    this.authService.stopImpersonation();
    this.hardNavigateTo('/dashboard/users');
  }

  /** A thin, overridable seam around the real navigation -- real browsers refuse to let a spec stub `window.location` itself. */
  protected hardNavigateTo(url: string): void {
    window.location.href = url;
  }
}
