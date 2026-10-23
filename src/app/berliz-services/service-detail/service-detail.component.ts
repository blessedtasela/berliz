import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { Centers } from 'src/app/models/centers.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { loadActiveCenters } from 'src/app/state/center/center.actions';
import { selectActiveCenters } from 'src/app/state/center/center.selectors';
import { loadActiveTrainers } from 'src/app/state/trainer/trainer.actions';
import { selectActiveTrainers } from 'src/app/state/trainer/trainer.selector';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';
import { BERLIZ_SERVICES, BerlizService, findService, trainersForService } from '../berliz-services';

/** How many providers the page previews before sending the visitor to the full directory. */
const PREVIEW_COUNT = 4;

/**
 * One thing Berliz offers, in detail: what it is, how it works, what you get, who it suits, and — for the training
 * modes and gyms — the trainers or centers you can book right now, with a button into the directory (a training
 * mode opens the trainers list already filtered to it).
 */
@Component({
  selector: 'app-service-detail',
  imports: [CommonModule, RouterModule, IconsModule],
  templateUrl: './service-detail.component.html',
})
export class ServiceDetailComponent implements OnInit, OnDestroy {
  service: BerlizService | null = null;
  resolved = false;
  readonly others: BerlizService[] = BERLIZ_SERVICES;

  /** Trainers who offer this service's mode, and the first few of them. */
  trainers: Trainers[] = [];
  centers: Centers[] = [];
  private allTrainers: Trainers[] = [];

  private subs: Subscription[] = [];

  constructor(private route: ActivatedRoute, private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(loadActiveTrainers());
    this.store.dispatch(loadActiveCenters());

    this.subs.push(
      this.route.paramMap.subscribe(params => {
        this.service = findService(params.get('slug')) ?? null;
        this.resolved = true;
        this.derive();
      }),
      this.store.select(selectActiveTrainers).subscribe(list => {
        this.allTrainers = list ?? [];
        this.derive();
      }),
      this.store.select(selectActiveCenters).subscribe(list => {
        this.centers = list ?? [];
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private derive(): void {
    this.trainers = this.service ? trainersForService(this.service, this.allTrainers) : [];
  }

  get previewTrainers(): Trainers[] { return this.trainers.slice(0, PREVIEW_COUNT); }
  get previewCenters(): Centers[] { return this.centers.slice(0, PREVIEW_COUNT); }

  /** The directory the main button opens: trainers pre-filtered to the mode, or all centers. */
  get ctaLink(): string[] { return this.service?.audience === 'centers' ? ['/centers'] : ['/trainers']; }
  get ctaQueryParams(): { mode?: string } | null { return this.service?.mode ? { mode: this.service.mode } : null; }

  photoUrl(p: { photoResponse?: { photoUrl?: string } | null } | null | undefined): string {
    const url = p?.photoResponse?.photoUrl;
    return url ? resolveStrapiUrl(url) : 'assets/avatar.png';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }

  formatUrl(name: string): string {
    return name?.replace(/ /g, '-').toLowerCase() ?? '';
  }

  trackBySlug(_: number, s: BerlizService): string { return s.slug; }
}
