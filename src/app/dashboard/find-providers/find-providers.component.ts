import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, Subscription, takeUntil } from 'rxjs';

import { Trainers } from 'src/app/models/trainers.interface';
import { Centers } from 'src/app/models/centers.interface';
import { loadActiveTrainers } from 'src/app/state/trainer/trainer.actions';
import { selectActiveTrainers } from 'src/app/state/trainer/trainer.selector';
import { loadActiveCenters } from 'src/app/state/center/center.actions';
import { selectActiveCenters } from 'src/app/state/center/center.selectors';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';

type ProviderTab = 'trainers' | 'centers';

/**
 * Dashboard-native "find a trainer or center" page — a signed-in user should
 * never have to leave the dashboard shell to browse providers. Replaces the
 * two separate "Find a Trainer" / "Find a Center" sidebar entries (which
 * reused the public dark-themed pages) with one page, styled to match the
 * rest of the dashboard, toggled locally between the two provider types.
 *
 * Clicking a card still lands on /dashboard/find-trainers/:name or
 * /dashboard/find-centers/:id/:name — those routes are unchanged (they mount
 * the existing rich profile pages), just no longer linked directly from the
 * sidebar now that this page is the entry point.
 */
@Component({
  selector: 'app-find-providers',
  templateUrl: './find-providers.component.html',
  styleUrls: ['./find-providers.component.css']
})
export class FindProvidersComponent implements OnInit, OnDestroy {

  tab: ProviderTab = 'trainers';
  searchQuery = '';

  trainers: Trainers[] = [];
  centers: Centers[] = [];

  private destroy$ = new Subject<void>();
  private subs: Subscription[] = [];

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(loadActiveTrainers());
    this.store.dispatch(loadActiveCenters());

    this.subs.push(
      this.store.select(selectActiveTrainers).pipe(takeUntil(this.destroy$)).subscribe(list => this.trainers = list ?? []),
      this.store.select(selectActiveCenters).pipe(takeUntil(this.destroy$)).subscribe(list => this.centers = list ?? []),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subs.forEach(s => s.unsubscribe());
  }

  setTab(tab: ProviderTab): void {
    this.tab = tab;
    this.searchQuery = '';
  }

  get filteredTrainers(): Trainers[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.trainers;
    return this.trainers.filter(t =>
      t.name?.toLowerCase().includes(q) ||
      t.categories?.some(c => c.name?.toLowerCase().includes(q)) ||
      t.locations?.some(l => l.city?.toLowerCase().includes(q) || l.country?.toLowerCase().includes(q))
    );
  }

  get filteredCenters(): Centers[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.centers;
    return this.centers.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q)
    );
  }

  trainerPhotoUrl(trainer: Trainers): string {
    return resolveStrapiUrl(trainer?.photoResponse?.photoUrl) || 'assets/avatar.png';
  }

  centerPhotoUrl(center: Centers): string {
    return resolveStrapiUrl(center?.photoUrl) || 'assets/avatar.png';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }

  formatUrl(name: string): string {
    return name?.replace(/ /g, '-').toLowerCase() ?? '';
  }

  primaryLocationLabel(trainer: Trainers): string {
    const first = trainer?.locations?.[0];
    if (!first) return '—';
    return [first.city, first.country].filter(Boolean).join(', ');
  }

  extraLocationCount(trainer: Trainers): number {
    return Math.max(0, (trainer?.locations?.length ?? 0) - 1);
  }

  serviceModeLabel(trainer: Trainers): string {
    switch (trainer?.serviceMode) {
      case 'ONLINE': return 'Online';
      case 'HYBRID': return 'Hybrid';
      case 'IN_PERSON':
      default: return 'In-person';
    }
  }
}
