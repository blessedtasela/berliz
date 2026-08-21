import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Categories } from 'src/app/models/categories.interface';
import {
  CenterAnnouncements,
  CenterEquipment,
  CenterIntroduction,
  CenterLocations,
  CenterPhotoAlbum,
  CenterPricing,
  CenterReviews,
  CenterTrainers,
  CenterVideoAlbum,
  Centers,
} from 'src/app/models/centers.interface';
import { Testimonials } from 'src/app/models/testimonials.model';
import { Trainers } from 'src/app/models/trainers.interface';
import { CenterService } from 'src/app/services/center.service';
import { TestimonialDialogService } from 'src/app/testimonial/testimonial-dialog.service';
import { BookingDialogService } from 'src/app/booking/booking-dialog.service';
import { CenterTrainerCard } from '../center-trainers/center-trainers.component';

import * as CenterActions from 'src/app/state/center/center.actions';
import * as CenterSelectors from 'src/app/state/center/center.selectors';
import * as CategoryActions from 'src/app/state/category/category.actions';
import * as CategorySelectors from 'src/app/state/category/category.selectors';
import * as TrainerActions from 'src/app/state/trainer/trainer.actions';
import * as TrainerSelectors from 'src/app/state/trainer/trainer.selector';
import * as TestimonialActions from 'src/app/state/testimonial/testimonial.actions';
import * as TestimonialSelectors from 'src/app/state/testimonial/testimonial.selectors';

/**
 * PUBLIC center profile page — route `/centers/:id`.
 *
 * Introduction / equipment / pricing / photo albums / video albums / locations /
 * trainer roster are fetched directly via CenterService's public
 * getXxxByCenterId() calls rather than through the NgRx store — the backend
 * used to only expose admin-only "load all" endpoints for these (401s for
 * anyone but an admin, which is why they silently never showed up here for
 * regular or logged-out visitors), and the store's global list state isn't a
 * good fit for what's really a single-center, single-view fetch anyway.
 * Announcements and reviews already have center-scoped "active" endpoints and
 * are used as-is via the store.
 */
@Component({
  selector: 'app-center-detail',
  templateUrl: './center-detail.component.html',
  styleUrls: ['./center-detail.component.css']
})
export class CenterDetailComponent implements OnInit, OnDestroy {

  centerId: number = 0;

  center: Centers | null = null;
  centerIntro: CenterIntroduction | null = null;
  centerCategories: Categories[] = [];
  centerLocation: CenterLocations[] = [];
  centerEquipment: CenterEquipment[] = [];
  centerTrainer: CenterTrainerCard[] = [];
  centerPricing: CenterPricing | null = null;
  centerAnnouncements: CenterAnnouncements[] = [];
  centerReview: CenterReviews[] = [];
  centerAlbums: CenterPhotoAlbum[] = [];
  centerVideoAlbums: CenterVideoAlbum[] = [];
  centerTestimonials: Testimonials[] = [];

  loading: boolean = true;
  notFound: boolean = false;

  private affiliations: CenterTrainers[] = [];
  private activeTrainers: Trainers[] = [];
  private allCategories: Categories[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private centerService: CenterService,
    private testimonialDialog: TestimonialDialogService,
    private bookingDialog: BookingDialogService,
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.route.paramMap.subscribe(params => {
        const idParam = params.get('id');

        if (idParam === null) {
          this.showNotFound("Missing 'id' parameter");
          return;
        }

        const id = +idParam;
        if (isNaN(id) || id <= 0) {
          this.showNotFound("Invalid 'id' parameter: not a valid positive number");
          return;
        }

        this.centerId = id;
        this.notFound = false;
        this.loading = true;
        this.fetchCenter();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // ===========================================================================
  // DATA
  // ===========================================================================

  /**
   * There is no public "get center by id" endpoint, so we follow the pattern
   * already used by CenterGuard / CenterPageComponent: load the active centers
   * and resolve the one matching the route id client-side. The center's public
   * sub-sections (introduction, equipment, etc.) do have per-center public
   * endpoints, fetched below directly through CenterService.
   */
  private fetchCenter(): void {
    // Id-scoped public endpoints, via the store.
    this.store.dispatch(CenterActions.loadActiveCenters());
    this.store.dispatch(CenterActions.loadActiveCenterAnnouncements({ id: this.centerId }));
    this.store.dispatch(CenterActions.loadActiveCenterReviews({ id: this.centerId }));
    this.store.dispatch(TestimonialActions.loadTestimonialsByCenter({ centerId: this.centerId }));

    // Reference data used to enrich the page
    this.store.dispatch(CategoryActions.loadActiveCategories());
    this.store.dispatch(TrainerActions.loadActiveTrainers());

    this.subscription.add(
      this.store.select(CenterSelectors.selectActiveCenters).subscribe(centers => {
        if (!centers || centers.length === 0) {
          return;
        }
        const match = centers.find(c => c.id === this.centerId) ?? null;
        this.center = match;
        this.loading = false;
        this.notFound = match === null;
        this.buildCategories();
      })
    );

    this.subscription.add(
      this.store.select(CenterSelectors.selectActiveCenterAnnouncements).subscribe(list => {
        this.centerAnnouncements = this.forThisCenter(list);
      })
    );

    this.subscription.add(
      this.store.select(CenterSelectors.selectActiveCenterReviews).subscribe(list => {
        this.centerReview = this.forThisCenter(list);
      })
    );

    this.subscription.add(
      this.store.select(TrainerSelectors.selectActiveTrainers).subscribe(trainers => {
        this.activeTrainers = trainers ?? [];
        this.buildTrainerCards();
      })
    );

    this.subscription.add(
      this.store.select(TestimonialSelectors.selectTestimonialsByCenter).subscribe(list => {
        this.centerTestimonials = this.forThisCenter(list);
      })
    );

    this.subscription.add(
      this.store.select(CategorySelectors.selectActiveCategories).subscribe(categories => {
        this.allCategories = categories ?? [];
        this.buildCategories();
      })
    );

    // Public, single-center endpoints — no auth required, no client-side filtering.
    const id = this.centerId;

    this.subscription.add(
      this.centerService.getIntroductionsByCenterId(id)
        .pipe(catchError(() => of(null)))
        .subscribe(res => this.centerIntro = (res?.data ?? [])[0] ?? null)
    );

    this.subscription.add(
      this.centerService.getLocationsByCenterId(id)
        .pipe(catchError(() => of(null)))
        .subscribe(res => this.centerLocation = res?.data ?? [])
    );

    this.subscription.add(
      this.centerService.getEquipmentByCenterId(id)
        .pipe(catchError(() => of(null)))
        .subscribe(res => this.centerEquipment = res?.data ?? [])
    );

    this.subscription.add(
      this.centerService.getPricingByCenterId(id)
        .pipe(catchError(() => of(null)))
        .subscribe(res => this.centerPricing = res?.data?.id ? res.data : null)
    );

    this.subscription.add(
      this.centerService.getPhotoAlbumsByCenterId(id)
        .pipe(catchError(() => of(null)))
        .subscribe(res => this.centerAlbums = res?.data ?? [])
    );

    this.subscription.add(
      this.centerService.getVideoAlbumsByCenterId(id)
        .pipe(catchError(() => of(null)))
        .subscribe(res => this.centerVideoAlbums = res?.data ?? [])
    );

    this.subscription.add(
      this.centerService.getCenterTrainersByCenterId(id)
        .pipe(catchError(() => of(null)))
        .subscribe(res => {
          this.affiliations = (res?.data ?? []).filter(t => t.status !== 'INACTIVE');
          this.buildTrainerCards();
        })
    );
  }

  private forThisCenter<T extends { centerId: number }>(list: T[] | null): T[] {
    return (list ?? []).filter(item => item.centerId === this.centerId);
  }

  private buildCategories(): void {
    const ids = this.center?.categoryIds ?? [];
    this.centerCategories = this.allCategories.filter(c => ids.includes(c.id));
  }

  private buildTrainerCards(): void {
    this.centerTrainer = this.affiliations.map(a => {
      const trainer = this.activeTrainers.find(t => t.id === a.trainerId);
      return {
        id: a.id,
        trainerId: a.trainerId,
        trainerName: trainer?.name ?? a.trainerName,
        slug: this.formatStringToUrl(trainer?.name ?? a.trainerName),
        photoUrl: trainer?.photoResponse?.photoUrl ?? '',
        motto: trainer?.motto ?? '',
        experience: trainer?.experience ?? '',
        status: a.status,
        date: a.date,
      } as CenterTrainerCard;
    });
  }

  private showNotFound(reason: string): void {
    console.warn(`[CenterDetail] ${reason}`);
    this.loading = false;
    this.notFound = true;
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  formatStringToUrl(value: string | undefined): string {
    return (value ?? '').trim().replace(/\s+/g, '-').toLowerCase();
  }

  openLocation(url: string | undefined): void {
    if (url) {
      window.open(url, '_blank', 'noopener');
    }
  }

  mapsUrl(center: { location?: string; address?: string }): string {
    if (center.location) return center.location;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.address || '')}`;
  }

  /**
   * Reuses the shared login-gated dialog trigger. The form does not support
   * pre-selecting a target, so this opens the generic form.
   */
  leaveTestimonial(): void {
    this.testimonialDialog.openTestimonialForm();
  }

  /** Opens the "Book a session" form for this center. */
  bookSession(): void {
    if (!this.center) return;
    this.bookingDialog.openBookingForm({
      centerId: this.centerId,
      providerName: this.center.name || 'this center'
    });
  }

  testimonialAuthor(testimonial: Testimonials): string {
    return testimonial.clientName
      || `${testimonial.userFirstname ?? ''} ${testimonial.userLastname ?? ''}`.trim()
      || 'Berliz member';
  }

  backToCenters(): void {
    this.router.navigate(['/centers']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
