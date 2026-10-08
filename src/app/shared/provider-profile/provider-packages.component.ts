import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { ProviderPackage } from 'src/app/models/provider-package.model';
import { ProviderPackageService } from 'src/app/services/provider-package.service';
import { ProfileTheme, ProfileThemeClasses, profileTheme } from './profile-theme';

/**
 * A provider's active packages and memberships as plan cards. Fetches its own
 * data from the public endpoint. With `bookLink` the cards link to the booking
 * page; with `selectable` they emit `choose` instead.
 */
@Component({
  selector: 'app-provider-packages',
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <section *ngIf="loaded && (packages.length > 0 || showEmpty)" [ngClass]="t.card" class="font-sans">
      <div class="flex flex-col gap-1 mb-4">
        <span class="text-[11px] uppercase tracking-wide font-semibold" [ngClass]="t.eyebrow">{{ eyebrow }}</span>
        <h2 class="text-lg font-extrabold leading-tight" [ngClass]="t.heading">Packages &amp; <span [ngClass]="t.accent">memberships</span></h2>
      </div>

      <p *ngIf="packages.length === 0" class="text-xs" [ngClass]="t.muted">No packages published yet.</p>

      <div *ngIf="packages.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div *ngFor="let p of packages; let first = first" [ngClass]="t.tile"
             class="p-4 flex flex-col gap-3 relative"
             [class.ring-1]="isPopular(first)" [class.ring-red-500]="isPopular(first)">
          <span *ngIf="isPopular(first)"
                class="absolute -top-2 left-4 text-[10px] font-bold uppercase tracking-wide bg-red-600 text-white px-2 py-0.5 rounded-full">Popular</span>

          <div class="flex flex-col gap-0.5">
            <h3 class="text-sm font-bold" [ngClass]="t.heading">{{ p.name }}</h3>
            <p *ngIf="p.description" class="text-[11px] leading-snug line-clamp-3" [ngClass]="t.muted">{{ p.description }}</p>
          </div>

          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-extrabold" [ngClass]="t.heading">{{ p.price | currency:p.currency:'symbol':'1.0-2' }}</span>
            <span class="text-[11px]" [ngClass]="t.muted">{{ p.billingType === 'RECURRING' ? '/ billing cycle' : 'one-time' }}</span>
          </div>

          <ul class="flex flex-col gap-1.5 text-[11px]" [ngClass]="t.body">
            <li *ngIf="p.sessionCount" class="flex items-center gap-1.5">
              <i-feather name="check" [ngClass]="t.accent" style="width:12px;height:12px;"></i-feather>
              {{ p.sessionCount }} session{{ p.sessionCount === 1 ? '' : 's' }}
              <span [ngClass]="t.muted">· {{ perSession(p) | currency:p.currency:'symbol':'1.0-2' }} each</span>
            </li>
            <li *ngIf="!p.sessionCount" class="flex items-center gap-1.5">
              <i-feather name="check" [ngClass]="t.accent" style="width:12px;height:12px;"></i-feather> Unlimited sessions
            </li>
            <li *ngIf="p.durationDays" class="flex items-center gap-1.5">
              <i-feather name="check" [ngClass]="t.accent" style="width:12px;height:12px;"></i-feather> Valid for {{ p.durationDays }} days
            </li>
            <li class="flex items-center gap-1.5">
              <i-feather name="check" [ngClass]="t.accent" style="width:12px;height:12px;"></i-feather>
              {{ p.groupSize > 1 ? 'Group of up to ' + p.groupSize : 'One-on-one' }}
            </li>
          </ul>

          <a *ngIf="bookLink" [routerLink]="bookLink"
             class="mt-auto text-center px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition">Choose this plan</a>
          <button *ngIf="!bookLink && selectable" type="button" (click)="choose.emit(p)"
             class="mt-auto px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition">Choose this plan</button>
        </div>
      </div>
    </section>
  `
})
export class ProviderPackagesComponent implements OnChanges {
  @Input() theme: ProfileTheme = 'light';
  @Input() trainerId: number | null | undefined = null;
  @Input() centerId: number | null | undefined = null;
  @Input() bookLink: any[] | null = null;
  @Input() eyebrow = 'Save on regular training';
  @Input() showEmpty = false;
  /** Marketing pages flag the first plan; the business view keeps cards neutral. */
  @Input() highlightFirst = false;
  /** Show a button that emits `choose` even without a `bookLink`. */
  @Input() selectable = false;
  @Output() choose = new EventEmitter<ProviderPackage>();

  packages: ProviderPackage[] = [];
  loaded = false;

  constructor(private packageService: ProviderPackageService) { }

  get t(): ProfileThemeClasses { return profileTheme(this.theme); }

  isPopular(first: boolean): boolean {
    return this.highlightFirst && first && this.packages.length > 1;
  }

  perSession(p: ProviderPackage): number {
    return p.sessionCount ? p.price / p.sessionCount : p.price;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['trainerId'] && !changes['centerId']) return;
    if (!this.trainerId && !this.centerId) return;
    this.loaded = false;
    const req = this.trainerId
      ? this.packageService.getForTrainer(this.trainerId)
      : this.packageService.getForCenter(this.centerId as number);
    req.pipe(catchError(() => of(null))).subscribe(res => {
      this.packages = [...(res?.data ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      this.loaded = true;
    });
  }
}
