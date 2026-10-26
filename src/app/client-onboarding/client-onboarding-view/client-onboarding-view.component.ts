import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { ClientOnboarding } from 'src/app/models/client-onboarding.model';
import { AuthService } from 'src/app/services/auth.service';
import { ClientOnboardingService } from 'src/app/services/client-onboarding.service';
import { PageHeaderComponent } from 'src/app/shared/page-header/page-header.component';
import { OnboardingSummaryComponent } from '../onboarding-summary/onboarding-summary.component';

/**
 * A client's full onboarding answers for their trainer -- `/dashboard/clients/:userId/onboarding`. The server decides
 * who may read them (the client, an admin, or a trainer the client has a live booking or subscription with); anyone
 * else gets a 403, which this page shows as a plain "not available", never as the answers.
 */
@Component({
  selector: 'app-client-onboarding-view',
  imports: [CommonModule, RouterModule, IconsModule, PageHeaderComponent, OnboardingSummaryComponent],
  template: `
    <section class="font-sans flex flex-col gap-4 max-w-3xl mx-auto" data-testid="onboarding-view">
      <a routerLink="/dashboard/my-provider-bookings" class="text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition flex items-center gap-1.5 w-fit mt-4">
        <i-feather name="arrow-left" style="width:13px;height:13px;"></i-feather>
        Back to bookings
      </a>

      <div *ngIf="loading" class="flex items-center justify-center py-16">
        <div class="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-red-600 animate-spin"></div>
      </div>

      <div *ngIf="!loading && error" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-10 flex flex-col items-center gap-2 text-center" data-testid="onboarding-view-error">
        <p class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ forbidden ? 'Not available' : 'We could not load this' }}</p>
        <p class="text-[11px] text-gray-400 dark:text-gray-500 max-w-xs">{{ error }}</p>
        <button *ngIf="!forbidden" type="button" (click)="load()" class="mt-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition">Try again</button>
      </div>

      <ng-container *ngIf="!loading && !error && data">
        <app-page-header icon="user" [title]="data.clientName + ' · onboarding'"
          [subtitle]="data.started ? (data.completionPercent + '% of the required answers' + (data.complete ? ' · complete' : '')) : 'They have not started onboarding yet.'"></app-page-header>

        <div class="flex flex-wrap items-center gap-2">
          <a [routerLink]="['/dashboard/messages']" [queryParams]="{ userId: data.userId }"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-1.5">
            <i-feather name="message-circle" style="width:13px;height:13px;"></i-feather> Message {{ data.clientName }}
          </a>
          <a *ngIf="isSelf" routerLink="/dashboard/onboarding" class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition">Edit my answers</a>
        </div>

        <div *ngIf="!data.complete && data.started" class="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300" data-testid="onboarding-incomplete">
          Onboarding is incomplete. You can ask {{ data.clientName }} to finish it in Messages before you confirm a session.
        </div>

        <app-onboarding-summary [data]="data"></app-onboarding-summary>
      </ng-container>
    </section>
  `,
})
export class ClientOnboardingViewComponent implements OnInit {
  data: ClientOnboarding | null = null;
  loading = true;
  error: string | null = null;
  forbidden = false;
  isSelf = false;

  private userId = 0;

  constructor(
    private route: ActivatedRoute,
    private service: ClientOnboardingService,
    private auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(p => {
      this.userId = Number(p.get('userId'));
      this.load();
    });
  }

  load(): void {
    if (!this.userId) {
      this.loading = false;
      this.forbidden = true;
      this.error = 'That link does not point to a client.';
      return;
    }
    this.loading = true;
    this.error = null;
    this.forbidden = false;
    this.service.getForClient(this.userId).pipe(take(1)).subscribe({
      next: (o) => {
        this.data = o;
        this.isSelf = this.auth.getCurrentUserId() === o.userId;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.data = null;
        this.forbidden = err.status === 403 || err.status === 404;
        this.error = this.forbidden
          ? 'You can only see the onboarding answers of clients you train.'
          : 'Check your connection and try again.';
      },
    });
  }
}
