import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';

/**
 * The one "this failed to load" state. The app has no global handler for failed
 * data loads (the auth interceptor only special-cases 401/403), so a failed load
 * is invisible unless the page itself renders it -- which is how a 500 on
 * /dashboard/details once looked like an empty Hub. Use this wherever a page
 * reads a slice's `error`: it is deliberately distinct from an empty state, and
 * always offers a way to retry.
 *
 * `compact` renders a slim inline banner for use above existing content (e.g. a
 * dashboard widget grid); the default is a centered block for a page's main area.
 */
@Component({
    selector: 'app-load-error',
    imports: [CommonModule, IconsModule],
    template: `
    <div *ngIf="compact; else block" role="alert"
      class="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
      <i-feather name="alert-circle" class="text-red-500 shrink-0" style="width:16px;height:16px;"></i-feather>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold text-red-700 dark:text-red-400">{{ title }}</p>
        <p *ngIf="message" class="text-[11px] text-red-600/80 dark:text-red-400/80 break-words">{{ message }}</p>
      </div>
      <button type="button" (click)="retry.emit()"
        class="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition">
        {{ retryLabel }}
      </button>
    </div>

    <ng-template #block>
      <div role="alert" class="flex flex-col items-center py-16 gap-3 text-center">
        <i-feather name="alert-circle" class="text-red-400" style="width:32px;height:32px;"></i-feather>
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ title }}</p>
        <p *ngIf="message" class="text-xs text-gray-400 dark:text-gray-500 max-w-xs break-words">{{ message }}</p>
        <button type="button" (click)="retry.emit()"
          class="mt-1 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition flex items-center gap-1.5">
          <i-feather name="refresh-cw" style="width:12px;height:12px;"></i-feather>
          {{ retryLabel }}
        </button>
      </div>
    </ng-template>
  `
})
export class LoadErrorComponent {
  @Input() title = "Couldn't load this";
  @Input() message: string | null = null;
  @Input() retryLabel = 'Try again';
  @Input() compact = false;
  @Output() retry = new EventEmitter<void>();
}
