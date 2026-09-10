import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';

/**
 * D9 — a small "Verified" tick shown on a workout/run log that a connected
 * trainer or center has confirmed. Two sizes; `by` fills the tooltip.
 */
@Component({
  selector: 'app-verified-badge',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <span
      class="inline-flex items-center gap-1 rounded-full font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100"
      [ngClass]="size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'"
      [title]="by ? 'Verified by ' + by : 'Verified activity'">
      <i-feather name="check-circle" [style.width.px]="size === 'sm' ? 11 : 13" [style.height.px]="size === 'sm' ? 11 : 13"></i-feather>
      <span>Verified</span>
    </span>
  `,
})
export class VerifiedBadgeComponent {
  @Input() by: string | null | undefined = null;
  @Input() size: 'sm' | 'md' = 'md';
}
