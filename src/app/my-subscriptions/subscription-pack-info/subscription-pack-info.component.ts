import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { IconsModule } from 'src/app/icons/icons.module';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { PLAN_KIND_LABEL, planKind } from 'src/app/utils/provider-package.util';

/**
 * What a subscription row says when it is something bought from a trainer or center (a plan, session pack or
 * membership) rather than a Berliz plan: what kind it is, who it's with, how many sessions are left, and a
 * shortcut to book one. Renders nothing for a Berliz plan.
 */
@Component({
  selector: 'app-subscription-pack-info',
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <div *ngIf="plan" class="mt-2 flex flex-col gap-1.5" data-testid="pack-info">
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900">
          {{ kindLabel }}
        </span>
        <span *ngIf="providerName" class="text-[11px] text-gray-500 dark:text-gray-400">with {{ providerName }}</span>
      </div>

      <div *ngIf="sessionsTotal !== null" class="flex flex-col gap-1" data-testid="sessions-left">
        <span class="text-[11px] text-gray-600 dark:text-gray-300">
          {{ sessionsRemaining }} of {{ sessionsTotal }} session{{ sessionsTotal === 1 ? '' : 's' }} left
        </span>
        <span class="h-1.5 w-full max-w-[12rem] rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" aria-hidden="true">
          <span class="block h-full rounded-full bg-red-500" [style.width.%]="percentLeft"></span>
        </span>
      </div>
      <span *ngIf="sessionsTotal === null" class="text-[11px] text-gray-600 dark:text-gray-300" data-testid="unlimited">Unlimited sessions</span>

      <a *ngIf="canBook" [routerLink]="bookLink" [queryParams]="{ plan: plan.id }" data-testid="book-from-pack"
        class="self-start text-[11px] font-semibold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1 transition">
        <i-feather name="calendar" style="width:11px;height:11px;"></i-feather>
        Book a session
      </a>
    </div>
  `,
})
export class SubscriptionPackInfoComponent {
  @Input() subscription!: Subscriptions;
  /** Set false on rows that have ended, so they say what they were but don't offer to book. */
  @Input() bookable = true;

  /** The trainer's or center's plan this was bought from; null for a Berliz plan. */
  get plan() {
    return this.subscription?.providerPackage ?? null;
  }

  get kindLabel(): string {
    return this.plan ? PLAN_KIND_LABEL[planKind(this.plan)] : '';
  }

  get providerName(): string {
    return this.subscription?.trainer?.name || this.subscription?.center?.name || '';
  }

  /** Total sessions in a pack; null for an unlimited plan. */
  get sessionsTotal(): number | null {
    return this.subscription?.sessionsTotal ?? this.plan?.sessionCount ?? null;
  }

  get sessionsRemaining(): number {
    return Math.max(0, this.subscription?.sessionsRemaining ?? this.sessionsTotal ?? 0);
  }

  get percentLeft(): number {
    const total = this.sessionsTotal;
    return total ? Math.min(100, Math.round((this.sessionsRemaining / total) * 100)) : 0;
  }

  get canBook(): boolean {
    if (!this.bookable || !this.plan || !this.providerName) return false;
    return this.sessionsTotal === null || this.sessionsRemaining > 0;
  }

  /** The provider's booking page; it opens on this plan. */
  get bookLink(): string[] {
    const slug = this.providerName.split(' ').join('-');
    return [this.subscription?.trainer?.name ? '/trainers' : '/centers', slug, 'book'];
  }
}
