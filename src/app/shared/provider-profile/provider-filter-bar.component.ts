import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { ProfileTheme } from './profile-theme';
import {
  DEFAULT_PROVIDER_CRITERIA, ProviderFilterCriteria, ProviderMode, ProviderSort,
  RATE_CEILINGS, SORT_OPTIONS, activeFilterCount, isDefaultCriteria
} from './provider-filters';

/**
 * Filter + sort controls for a trainer/center list. Emits a fresh criteria object on every change;
 * the list owner applies it with `applyProviderFilters`. `shown` / `total` make the effect of a
 * filter visible immediately (and tell you when it matched nothing).
 */
@Component({
  selector: 'app-provider-filter-bar',
  imports: [CommonModule, IconsModule],
  template: `
    <div class="font-sans flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <label class="flex items-center gap-1.5 text-[11px]" [ngClass]="muted">
          Sort
          <select (change)="setSort($any($event.target).value)"
                  [ngClass]="field" aria-label="Sort providers">
            <option *ngFor="let o of sortOptions" [value]="o.value" [selected]="criteria.sort === o.value">{{ o.label }}</option>
          </select>
        </label>

        <ng-container *ngIf="showMode">
          <button *ngFor="let m of modes" type="button" (click)="setMode(m.value)"
                  [attr.aria-pressed]="criteria.mode === m.value"
                  class="px-3 py-1 rounded-full text-[11px] font-semibold border transition"
                  [ngClass]="criteria.mode === m.value ? chipOn : chipOff">{{ m.label }}</button>
        </ng-container>

        <label class="flex items-center gap-1.5 text-[11px]" [ngClass]="muted">
          Rate
          <select (change)="setMaxRate($any($event.target).value)"
                  [ngClass]="field" aria-label="Maximum hourly rate">
            <option value="" [selected]="criteria.maxRate === null">Any</option>
            <option *ngFor="let r of ceilings" [value]="r" [selected]="criteria.maxRate === r">Up to \${{ r }}/hr</option>
          </select>
        </label>

        <button type="button" (click)="toggleReviews()" [attr.aria-pressed]="criteria.withReviews"
                class="px-3 py-1 rounded-full text-[11px] font-semibold border transition"
                [ngClass]="criteria.withReviews ? chipOn : chipOff">Has reviews</button>

        <button *ngIf="!isDefault" type="button" (click)="reset()"
                class="px-2 py-1 text-[11px] font-semibold text-red-500 hover:text-red-400 transition flex items-center gap-1">
          <i-feather name="x" style="width:11px;height:11px;"></i-feather> Reset
        </button>
      </div>

      <p class="text-[11px]" [ngClass]="muted" aria-live="polite">
        {{ shown }} of {{ total }} {{ noun }}<span *ngIf="filterCount > 0"> · {{ filterCount }} filter{{ filterCount === 1 ? '' : 's' }} on</span>
      </p>
    </div>
  `
})
export class ProviderFilterBarComponent {
  @Input() criteria: ProviderFilterCriteria = { ...DEFAULT_PROVIDER_CRITERIA };
  @Input() theme: ProfileTheme = 'dark';
  /** Centers have no coaching mode, so they hide the mode chips. */
  @Input() showMode = true;
  @Input() shown = 0;
  @Input() total = 0;
  @Input() noun = 'providers';
  @Output() criteriaChange = new EventEmitter<ProviderFilterCriteria>();

  readonly sortOptions = SORT_OPTIONS;
  readonly ceilings = RATE_CEILINGS;
  readonly modes: { value: ProviderMode; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'IN_PERSON', label: 'In-person' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'HYBRID', label: 'Hybrid' },
  ];

  get isDefault(): boolean { return isDefaultCriteria(this.criteria); }
  get filterCount(): number { return activeFilterCount(this.criteria); }

  get muted(): string { return this.theme === 'dark' ? 'text-zinc-500' : 'text-gray-400 dark:text-gray-500'; }
  get field(): string {
    return this.theme === 'dark'
      ? 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-red-600'
      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-red-400';
  }
  get chipOn(): string { return 'bg-red-600 border-red-600 text-white'; }
  get chipOff(): string {
    return this.theme === 'dark'
      ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-red-600/50 hover:text-white'
      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-300';
  }

  private emit(patch: Partial<ProviderFilterCriteria>): void {
    this.criteriaChange.emit({ ...this.criteria, ...patch });
  }

  setSort(value: ProviderSort): void { this.emit({ sort: value }); }
  setMode(value: ProviderMode): void { this.emit({ mode: value }); }
  setMaxRate(value: string | number | null): void {
    const n = value === null || value === '' || value === 'null' ? null : Number(value);
    this.emit({ maxRate: n !== null && Number.isFinite(n) ? n : null });
  }
  toggleReviews(): void { this.emit({ withReviews: !this.criteria.withReviews }); }
  reset(): void { this.criteriaChange.emit({ ...DEFAULT_PROVIDER_CRITERIA }); }
}
