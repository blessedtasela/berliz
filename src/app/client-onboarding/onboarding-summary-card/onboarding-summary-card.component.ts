import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable, catchError, of, take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { ClientOnboarding } from 'src/app/models/client-onboarding.model';
import { AuthService } from 'src/app/services/auth.service';
import { ClientOnboardingService } from 'src/app/services/client-onboarding.service';
import { GOALS, LEVELS, TRAINING_MODES, labelOf, labelsOf } from '../client-onboarding.options';

/**
 * The read-only onboarding summary at the top of a trainer-client conversation. A trainer sees the client's answers
 * (and a link to the full view); a client sees their own with a link to edit. The server only answers a trainer who
 * is connected to the client, so when the other person is not a client of theirs (a connection, another trainer) the
 * request is refused and the card simply does not render.
 */
@Component({
  selector: 'app-onboarding-summary-card',
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <div *ngIf="data" class="mx-4 mt-3 mb-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col gap-1.5 shrink-0" data-testid="onboarding-card">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
          <i-feather name="clipboard" style="width:12px;height:12px;"></i-feather>
          {{ asClient ? 'Your onboarding' : data.clientName + '\\'s onboarding' }}
          <span class="font-normal text-gray-400 dark:text-gray-500">· {{ data.started ? data.completionPercent + '% done' : 'not started' }}</span>
        </span>
        <a *ngIf="asClient" routerLink="/dashboard/onboarding" class="text-[11px] font-semibold text-red-600 hover:text-red-700" data-testid="onboarding-card-edit">{{ data.complete ? 'Edit' : 'Finish' }}</a>
        <a *ngIf="!asClient" [routerLink]="['/dashboard/clients', data.userId, 'onboarding']" class="text-[11px] font-semibold text-red-600 hover:text-red-700" data-testid="onboarding-card-view">View all</a>
      </div>
      <p *ngIf="data.started && highlights" class="text-[11px] text-gray-500 dark:text-gray-400">{{ highlights }}</p>
      <p *ngIf="!data.started && !asClient" class="text-[11px] text-gray-500 dark:text-gray-400">You can ask them to fill it in here in Messages.</p>
    </div>
  `,
})
export class OnboardingSummaryCardComponent implements OnChanges {
  /** The other person in the open conversation. */
  @Input() otherUserId: number | null = null;
  @Input() otherRole: string | null | undefined = null;

  data: ClientOnboarding | null = null;
  asClient = false;

  constructor(private service: ClientOnboardingService, private auth: AuthService) { }

  ngOnChanges(_: SimpleChanges): void {
    this.data = null;
    if (!this.otherUserId) return;

    const me = (this.auth.getCurrentUserRole() || '').toLowerCase();
    const other = (this.otherRole || '').toLowerCase();
    let request: Observable<ClientOnboarding | null> | null = null;

    if (me === 'trainer' && other !== 'trainer') {
      this.asClient = false;
      request = this.service.getForClient(this.otherUserId);
    } else if (me !== 'trainer' && other === 'trainer') {
      this.asClient = true;
      request = this.service.getMine();
    }
    if (!request) return;

    const id = this.otherUserId;
    request.pipe(take(1), catchError(() => of(null))).subscribe(o => {
      if (id === this.otherUserId) this.data = o;
    });
  }

  /** One line: level, how they train and goals, e.g. "Beginner · Online · Strength, Fat loss". */
  get highlights(): string {
    const d = this.data;
    if (!d) return '';
    return [
      labelOf(LEVELS, d.fitnessLevel),
      labelOf(TRAINING_MODES, d.trainingMode),
      labelsOf(GOALS, d.goals).join(', '),
    ].filter(Boolean).join(' · ');
  }
}
