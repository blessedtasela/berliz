import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { DemoService, isDemoEmail } from 'src/app/services/demo.service';
import { selectUser } from 'src/app/state/user/user.selector';
import { TourService } from './tour.service';

/**
 * Shown only while signed in to a demo account: says what this is (so nothing in it is mistaken for real),
 * offers the 30-second tour, and is the way out to a real sign-up.
 */
@Component({
  selector: 'app-demo-banner',
  imports: [CommonModule, IconsModule],
  template: `
    <div *ngIf="isDemo$ | async" role="status"
         class="mb-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans">
      <span class="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200 flex-1 min-w-[12rem]">
        <i-feather name="info" style="width:14px;height:14px;" class="shrink-0"></i-feather>
        <span><strong>You're exploring a demo.</strong> Nothing here is real, and it resets every night.</span>
      </span>
      <span class="flex items-center gap-2 shrink-0">
        <button type="button" (click)="tour.start()"
                class="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition">
          Take a 30-second tour
        </button>
        <button type="button" (click)="demo.leaveForSignup()"
                class="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition">
          Create your free account
        </button>
      </span>
    </div>
  `
})
export class DemoBannerComponent {
  isDemo$: Observable<boolean>;

  constructor(store: Store, public tour: TourService, public demo: DemoService) {
    this.isDemo$ = store.select(selectUser).pipe(map(user => isDemoEmail(user?.email)));
  }
}
