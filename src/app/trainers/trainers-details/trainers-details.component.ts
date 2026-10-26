import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProviderPackage } from 'src/app/models/provider-package.model';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { LikersModalComponent } from 'src/app/shared/likers-modal/likers-modal.component';
import { Subscription, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import {
  TrainerBenefits,
  TrainerFeatureVideo,
  TrainerIntroduction,
  TrainerPhotoAlbum,
  TrainerPricing,
  TrainerReview,
  TrainerVideoAlbum,
  Trainers
} from 'src/app/models/trainers.interface';
import { Testimonials } from 'src/app/models/testimonials.model';
import { ProviderAnalyticsService } from 'src/app/services/provider-analytics.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { SeoService } from 'src/app/services/seo.service';
import { environment } from 'src/environments/environment';
import { closestBySlug, nameSlug } from 'src/app/utils/closest-slug';
import { TestimonialDialogService } from 'src/app/testimonial/testimonial-dialog.service';
import { BookingLauncherService } from 'src/app/booking/booking-launcher.service';
import { loadTestimonialsByTrainer } from 'src/app/state/testimonial/testimonial.actions';
import { selectTestimonialsByTrainer } from 'src/app/state/testimonial/testimonial.selectors';
import {
  loadActiveTrainerFeatureVideos,
  loadActiveTrainerReviews
} from 'src/app/state/trainer/trainer.actions';
import {
  selectActiveTrainerFeatureVideos,
  selectActiveTrainerReviews
} from 'src/app/state/trainer/trainer.selector';

/**
 * PUBLIC trainer profile page — route `/trainers/:name`.
 *
 * `:name` is the trainer name slugified with dashes (same convention the
 * TrainerGuard uses). We resolve the slug back to the real `Trainers` record,
 * then pull every public sub-entity for that trainer id.
 *
 * Introduction / benefits / pricing / photo album / video album are fetched
 * directly via TrainerService's public getXxxByTrainerId() calls rather than
 * through the NgRx store — the backend used to only expose admin-only "load
 * all" endpoints for these (401s for anyone but an admin, which is why they
 * silently never showed up here), and the store's global list state isn't a
 * good fit for what's really a single-object, single-view fetch anyway.
 * Feature videos and reviews already have trainer-scoped endpoints and are
 * used as-is via the store.
 */
@Component({
    selector: 'app-trainers-details',
    templateUrl: './trainers-details.component.html',
    styleUrls: ['./trainers-details.component.css'],
    standalone: false
})
export class TrainersDetailsComponent implements OnInit, OnDestroy {

  trainerId = 0;

  trainer: Trainers | null = null;
  trainerIntroduction: TrainerIntroduction | null = null;
  trainerBenefits: TrainerBenefits | null = null;
  trainerPricing: TrainerPricing | null = null;
  trainerPhotoAlbum: TrainerPhotoAlbum | null = null;
  trainerVideoAlbum: TrainerVideoAlbum | null = null;
  trainerFeatureVideos: TrainerFeatureVideo[] = [];
  trainerReviews: TrainerReview[] = [];
  trainerTestimonials: Testimonials[] = [];

  /** true once the trainer lookup resolved (either found or not found) */
  resolved = false;
  /** true when the slug does not match any active trainer */
  notFound = false;
  /** The trainer a mistyped slug most likely meant, offered on the not-found card. */
  suggestion: Trainers | null = null;

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private trainerService: TrainerService,
    private providerAnalytics: ProviderAnalyticsService,
    private seoService: SeoService,
    private testimonialDialog: TestimonialDialogService,
    private bookingLauncher: BookingLauncherService,
    private dialog: MatDialog
  ) { }

  /** Overridden by the dashboard-native subclass so its own "View profile" links
   *  never send a signed-in user out to the public /user/:username page. */
  protected get likersRoutePrefix(): string {
    return '/user';
  }

  /** Where an unknown trainer link is sent. Overridden by the dashboard subclass so a signed-in user stays inside the dashboard. */
  protected get directoryRoute(): string {
    return '/trainers';
  }

  /** Where a trainer's profile lives, for the "Did you mean...?" link. */
  protected get profileRoutePrefix(): string {
    return '/trainers';
  }

  suggestionLink(): string[] {
    return [this.profileRoutePrefix, nameSlug(this.suggestion?.name)];
  }

  viewLikers(): void {
    if (!this.trainer?.id) return;
    this.dialog.open(LikersModalComponent, {
      width: '380px',
      maxWidth: '95vw',
      data: { kind: 'trainer', id: this.trainer.id, routePrefix: this.likersRoutePrefix }
    });
  }

  ngOnInit(): void {
    this.subs.push(
      this.route.paramMap.subscribe(params => {
        const name = params.get('name');
        this.resolveTrainer(name);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ── Resolution ────────────────────────────────────────────────────────────

  private resolveTrainer(name: string | null): void {

    this.resolved = false;
    this.notFound = false;
    this.suggestion = null;

    if (!name) {
      this.resolved = true;
      this.notFound = true;
      return;
    }

    this.trainerService.getActiveTrainers()
      .pipe(take(1), catchError(() => of(null)))
      .subscribe(response => {

        const trainers = response?.data ?? [];
        // Compare case-insensitively: the route param arrives lowercased by
        // UrlLowerCaseSerializer on refresh/direct-load, but trainer.name
        // keeps its original casing — a case-sensitive match here 404s any
        // mixed-case name specifically (and only) on refresh.
        const match = trainers.find(t => t.name?.replace(/ /g, '-').toLowerCase() === name.toLowerCase());

        this.resolved = true;

        if (!match) {
          this.trainer = null;
          this.suggestion = response ? closestBySlug(name, trainers, t => nameSlug(t.name)) : null;
          if (response && !this.suggestion) {
            // A dead link to a trainer who isn't here: land on the directory so there's something to browse.
            this.router.navigate([this.directoryRoute], { replaceUrl: true });
            return;
          }
          // A close slug gets a "Did you mean...?"; a failed load keeps the plain card rather than bouncing away.
          this.notFound = true;
          return;
        }

        this.trainer = match;
        this.trainerId = match.id;
        this.updateSeoTags(match);
        this.providerAnalytics.recordProfileView({ trainerId: match.id });
        this.loadPublicProfile();
        this.resumePendingAction();
      });
  }

  /** Overrides the generic route-driven "Trainers" SEO tags with this trainer's own. */
  private updateSeoTags(trainer: Trainers): void {
    const url = `${environment.baseUrl}/trainers/${trainer.name.replace(/ /g, '-')}`;
    const description = trainer.motto
      ? `${trainer.motto} — book ${trainer.name}, a certified personal trainer on Berliz.`
      : `Book ${trainer.name}, a certified personal trainer on Berliz.`;

    this.seoService.updatePageData({
      title: `${trainer.name} — Personal Trainer | Berliz`,
      description,
      imageUrl: trainer.photoResponse?.photoUrl || `${environment.assetsUrl}berliz-site.png`,
      ogType: 'profile',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: trainer.name,
        jobTitle: 'Personal Trainer',
        description,
        image: trainer.photoResponse?.photoUrl,
        url,
        worksFor: {
          '@type': 'Organization',
          name: 'Berliz Fitness',
          url: environment.baseUrl,
        },
      },
    }, url);
  }

  /**
   * A login gate (TestimonialDialogService) sent the
   * user here with ?action=book|testimonial after signing in -- finish what
   * they were trying to do instead of leaving them to find the button again.
   * Fires once and strips the query param so a manual refresh doesn't reopen it.
   */
  private resumePendingAction(): void {
    const action = this.route.snapshot.queryParamMap.get('action');
    if (!action) return;

    if (action === 'book') this.bookSession();
    if (action === 'testimonial') this.leaveTestimonial();

    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

  /** Hero's "See plans & pricing": glide to the packages section. */
  scrollToPlans(): void {
    document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Back to the trainers directory from the not-found state. */
  backToTrainers(): void {
    this.router.navigate([this.directoryRoute]);
  }

  // ── Data ──────────────────────────────────────────────────────────────────

  private loadPublicProfile(): void {

    const id = this.trainerId;

    // Public, single-trainer endpoints — no auth required, no client-side filtering.
    // The backend returns an empty (but non-null) response object when a trainer
    // hasn't set this section up yet, so treat "no id" as "not set" — matching
    // the previous null-when-absent contract these child components expect.
    this.subs.push(
      this.trainerService.getTrainerIntroductionByTrainerId(id)
        .pipe(catchError(() => of(null)))
        .subscribe(res => this.trainerIntroduction = res?.data?.id ? res.data : null),

      this.trainerService.getTrainerBenefitsByTrainerId(id)
        .pipe(catchError(() => of(null)))
        .subscribe(res => this.trainerBenefits = res?.data?.id ? res.data : null),

      this.trainerService.getTrainerPricingByTrainerId(id)
        .pipe(catchError(() => of(null)))
        .subscribe(res => this.trainerPricing = res?.data?.id ? res.data : null),

      this.trainerService.getTrainerPhotosAlbumByTrainerId(id)
        .pipe(catchError(() => of(null)))
        .subscribe(res => this.trainerPhotoAlbum = res?.data?.id ? res.data : null),

      this.trainerService.getTrainerVideosAlbumByTrainerId(id)
        .pipe(catchError(() => of(null)))
        .subscribe(res => this.trainerVideoAlbum = res?.data?.id ? res.data : null),
    );

    // Already trainer-scoped on the backend.
    this.store.dispatch(loadActiveTrainerFeatureVideos({ trainerId: id }));
    this.store.dispatch(loadActiveTrainerReviews({ id }));
    this.store.dispatch(loadTestimonialsByTrainer({ trainerId: id }));

    this.subs.push(
      this.store.select(selectActiveTrainerFeatureVideos).subscribe(list => {
        this.trainerFeatureVideos = (list ?? [])
          .filter(v => v.trainerId === id)
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      }),

      this.store.select(selectActiveTrainerReviews).subscribe(list => {
        this.trainerReviews = (list ?? []).filter(r => r.trainerId === id);
      }),

      this.store.select(selectTestimonialsByTrainer).subscribe(list => {
        this.trainerTestimonials = (list ?? []).filter(t => t.trainerId === id);
        this.scrollToDeepLinkTestimonial();
      })
    );
  }

  /** Deep link target -- ?testimonialId=<id> from search/notifications. Scrolled to (and briefly highlighted) once its section has actually rendered. */
  private deepLinkTestimonialId: number | null = null;
  private deepLinkTestimonialHandled = false;
  highlightedTestimonialId: number | null = null;

  private scrollToDeepLinkTestimonial(): void {
    if (this.deepLinkTestimonialId === null) {
      const raw = this.route.snapshot.queryParamMap.get('testimonialId');
      this.deepLinkTestimonialId = raw ? Number(raw) : 0;
    }
    if (!this.deepLinkTestimonialId || this.deepLinkTestimonialHandled) return;

    const exists = this.trainerTestimonials.some(t => t.id === this.deepLinkTestimonialId);
    if (!exists) return;

    this.deepLinkTestimonialHandled = true;
    this.highlightedTestimonialId = this.deepLinkTestimonialId;
    setTimeout(() => {
      document.getElementById(`testimonial-${this.deepLinkTestimonialId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /**
   * Reuses the shared login-gated dialog trigger. The form does not support
   * pre-selecting a target, so this opens the generic form.
   */
  leaveTestimonial(): void {
    this.testimonialDialog.openTestimonialForm();
  }

  /** Opens this trainer's booking page, to request a single session. */
  bookSession(): void {
    if (!this.trainer) return;
    this.bookingLauncher.startBooking({
      trainerId: this.trainerId,
      providerName: this.trainer.name || 'this trainer'
    });
  }

  /** Opens this trainer's Level Up page, to subscribe, buy a session pack or get a membership. */
  levelUp(): void {
    if (!this.trainer) return;
    this.bookingLauncher.startLevelUp({
      trainerId: this.trainerId,
      providerName: this.trainer.name || 'this trainer'
    });
  }

  /** A plan card was chosen: the Level Up page opens on that plan. */
  openPlan(plan: ProviderPackage): void {
    if (!this.trainer) return;
    this.bookingLauncher.startLevelUp({
      trainerId: this.trainerId,
      providerName: this.trainer.name
    }, plan.id);
  }

  testimonialAuthor(testimonial: Testimonials): string {
    return testimonial.clientName
      || `${testimonial.userFirstname ?? ''} ${testimonial.userLastname ?? ''}`.trim()
      || 'Berliz member';
  }
}
