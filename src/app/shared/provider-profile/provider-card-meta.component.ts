import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { ProfileTheme } from './profile-theme';

/**
 * The line every trainer/center card needs before anyone opens the profile: what a session costs and
 * how much social proof there is. A full price, never "from" -- or an honest "Rate on request".
 * (Reviews here are written testimonials, not a star score, so the count is the proof.)
 */
@Component({
  selector: 'app-provider-card-meta',
  imports: [CommonModule, IconsModule],
  template: `
    <div class="flex items-center justify-between gap-3 text-[11px] font-sans">
      <span *ngIf="rateNumber" [ngClass]="strong" class="font-bold">
        {{ rateNumber | currency:'USD':'symbol':'1.0-2' }}<span [ngClass]="muted" class="font-normal"> / hour</span>
      </span>
      <span *ngIf="!rateNumber" [ngClass]="muted">Rate on request</span>

      <span [ngClass]="muted" class="flex items-center gap-1" [attr.aria-label]="reviewLabel">
        <i-feather name="message-square" style="width:11px;height:11px;"></i-feather>
        {{ reviewLabel }}
      </span>
    </div>
  `
})
export class ProviderCardMetaComponent {
  @Input() rate: number | string | null | undefined = null;
  @Input() reviewCount: number | null | undefined = 0;
  @Input() theme: ProfileTheme = 'dark';

  get rateNumber(): number | null {
    if (this.rate === null || this.rate === undefined || this.rate === '') return null;
    const n = Number(this.rate);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  get reviewLabel(): string {
    const n = this.reviewCount ?? 0;
    return n === 1 ? '1 review' : `${n} reviews`;
  }

  get strong(): string { return this.theme === 'dark' ? 'text-white' : 'text-gray-900 dark:text-gray-100'; }
  get muted(): string { return this.theme === 'dark' ? 'text-zinc-500' : 'text-gray-400 dark:text-gray-500'; }
}
