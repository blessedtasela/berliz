import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';

/**
 * The icon tile + title + one-line subtitle every user-facing page opens with, for the admin list pages that used to
 * start straight at their search box (so an admin could not tell at a glance which list they were on).
 */
@Component({
  selector: 'app-page-header',
  imports: [CommonModule, IconsModule],
  template: `
    <div class="flex items-center gap-3 mt-4 mb-4">
      <div class="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 flex items-center justify-center shrink-0">
        <i-feather [name]="icon" class="text-red-600" style="width:16px;height:16px;"></i-feather>
      </div>
      <div class="min-w-0">
        <h1 class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ title }}</h1>
        <p *ngIf="subtitle" class="text-[11px] text-gray-400 dark:text-gray-500">{{ subtitle }}</p>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  @Input({ required: true }) icon = 'layers';
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
}
