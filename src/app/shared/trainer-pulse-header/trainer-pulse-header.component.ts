import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { AuthService } from 'src/app/services/auth.service';
import { loadDashboard } from 'src/app/state/dashboard/dashboard.actions';
import { selectDashboardData } from 'src/app/state/dashboard/dashboard.selectors';

/**
 * A trainer/center's quick pulse, at the very top of the feed (now the landing page for every role --
 * GN-75) -- active clients, upcoming bookings, packages, without leaving the feed to check. Reuses the
 * exact same `/dashboard/details` counts the full Dashboard Overview widget page already shows (one
 * dispatch of the existing `loadDashboard` action, same NgRx slice); this is a condensed at-a-glance strip,
 * not a second copy of that page. Renders nothing for a plain user -- there is nothing of this kind to
 * show them, same "hides entirely when irrelevant" pattern as FollowButtonComponent.
 */
@Component({
  selector: 'app-trainer-pulse-header',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <div *ngIf="visible" class="grid grid-cols-3 gap-2">
      <a routerLink="/dashboard/partnership/trainer-details"
        class="flex flex-col gap-1 rounded-xl border px-3 py-2.5 transition"
        [ngClass]="dark ? 'border-brand-border bg-brand-card hover:border-brand-red/40' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-red-300 dark:hover:border-red-800'">
        <div class="flex items-center gap-1.5" [ngClass]="dark ? 'text-brand-muted' : 'text-gray-400 dark:text-gray-500'">
          <i-feather name="users" style="width:12px;height:12px;"></i-feather>
          <span class="text-[10px] font-semibold uppercase tracking-wide">Active clients</span>
        </div>
        <span class="text-lg font-bold" [ngClass]="dark ? 'text-brand-text' : 'text-gray-900 dark:text-gray-100'">{{ activeClients }}</span>
      </a>

      <a routerLink="/dashboard/my-bookings"
        class="flex flex-col gap-1 rounded-xl border px-3 py-2.5 transition"
        [ngClass]="dark ? 'border-brand-border bg-brand-card hover:border-brand-red/40' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-red-300 dark:hover:border-red-800'">
        <div class="flex items-center gap-1.5" [ngClass]="dark ? 'text-brand-muted' : 'text-gray-400 dark:text-gray-500'">
          <i-feather name="clock" style="width:12px;height:12px;"></i-feather>
          <span class="text-[10px] font-semibold uppercase tracking-wide">Bookings</span>
        </div>
        <span class="text-lg font-bold" [ngClass]="dark ? 'text-brand-text' : 'text-gray-900 dark:text-gray-100'">{{ bookings }}</span>
      </a>

      <a routerLink="/dashboard/my-packages"
        class="flex flex-col gap-1 rounded-xl border px-3 py-2.5 transition"
        [ngClass]="dark ? 'border-brand-border bg-brand-card hover:border-brand-red/40' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-red-300 dark:hover:border-red-800'">
        <div class="flex items-center gap-1.5" [ngClass]="dark ? 'text-brand-muted' : 'text-gray-400 dark:text-gray-500'">
          <i-feather name="package" style="width:12px;height:12px;"></i-feather>
          <span class="text-[10px] font-semibold uppercase tracking-wide">Packages</span>
        </div>
        <span class="text-lg font-bold" [ngClass]="dark ? 'text-brand-text' : 'text-gray-900 dark:text-gray-100'">{{ packages }}</span>
      </a>
    </div>
  `
})
export class TrainerPulseHeaderComponent implements OnInit, OnDestroy {
  /** Permanently-dark brand skin for a GN-76-redesigned host page, independent of the light/dark theme toggle. */
  @Input() dark = false;

  visible = false;
  activeClients = 0;
  bookings = 0;
  packages = 0;

  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private store: Store) { }

  ngOnInit(): void {
    this.visible = this.authService.isTrainer() || this.authService.isCenter();
    if (!this.visible) return;

    this.store.dispatch(loadDashboard());
    this.store.select(selectDashboardData).pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (!data) return;
      this.activeClients = Number(data['myClients'] ?? 0);
      this.bookings = Number(data['myProviderBookings'] ?? 0);
      this.packages = Number(data['myPackages'] ?? 0);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
