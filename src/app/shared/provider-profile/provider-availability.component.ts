import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { catchError, of } from 'rxjs';

import { Availability } from 'src/app/models/availability.model';
import { AvailabilityService } from 'src/app/services/availability.service';
import { ProfileTheme, ProfileThemeClasses, profileTheme } from './profile-theme';

export interface AvailabilityDayRow { label: string; windows: string[]; }

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
/** Weeks read Monday-first for a fitness audience. */
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** "09:00:00" -> "9:00 AM". Anything unparseable is shown as-is rather than hidden. */
export function formatClock(value: string | null | undefined): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(value ?? '');
  if (!m) return value ?? '';
  const h = Number(m[1]);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m[2]} ${suffix}`;
}

/** The weekly hours a trainer or center takes bookings. Fetches its own data. */
@Component({
  selector: 'app-provider-availability',
  imports: [CommonModule],
  template: `
    <section *ngIf="loaded && (rows.length > 0 || showEmpty)" [ngClass]="t.card" class="font-sans">
      <div class="flex flex-col gap-1 mb-4">
        <span class="text-[11px] uppercase tracking-wide font-semibold" [ngClass]="t.eyebrow">When to train</span>
        <h2 class="text-lg font-extrabold leading-tight" [ngClass]="t.heading">Weekly <span [ngClass]="t.accent">hours</span></h2>
      </div>

      <p *ngIf="rows.length === 0" class="text-xs" [ngClass]="t.muted">No weekly hours published yet.</p>

      <div *ngIf="rows.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div *ngFor="let row of rows" [ngClass]="t.tile" class="px-4 py-2.5 flex items-center justify-between gap-3">
          <span class="text-xs font-semibold" [ngClass]="t.heading">{{ row.label }}</span>
          <span class="text-xs text-right" [ngClass]="row.windows.length ? t.body : t.muted">
            {{ row.windows.length ? row.windows.join(' · ') : 'Closed' }}
          </span>
        </div>
      </div>
    </section>
  `
})
export class ProviderAvailabilityComponent implements OnChanges {
  @Input() theme: ProfileTheme = 'light';
  @Input() trainerId: number | null | undefined = null;
  @Input() centerId: number | null | undefined = null;
  /** Business views show an explicit "nothing published" note; marketing pages just drop the card. */
  @Input() showEmpty = false;

  rows: AvailabilityDayRow[] = [];
  loaded = false;

  constructor(private availabilityService: AvailabilityService) { }

  get t(): ProfileThemeClasses { return profileTheme(this.theme); }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['trainerId'] && !changes['centerId']) return;
    if (!this.trainerId && !this.centerId) return;
    this.loaded = false;
    this.availabilityService
      .getProviderAvailability(this.trainerId ?? undefined, this.trainerId ? undefined : (this.centerId ?? undefined))
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        this.rows = ProviderAvailabilityComponent.toRows(res?.data ?? []);
        this.loaded = true;
      });
  }

  static toRows(items: Availability[]): AvailabilityDayRow[] {
    const active = items.filter(a => a.isActive);
    if (active.length === 0) return [];
    return DAY_ORDER.map(day => ({
      label: DAY_NAMES[day],
      windows: active
        .filter(a => a.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .map(a => `${formatClock(a.startTime)} – ${formatClock(a.endTime)}`),
    }));
  }
}
