import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
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
import { TrainerService } from 'src/app/services/trainer.service';
import { SeoService } from 'src/app/services/seo.service';
import { environment } from 'src/environments/environment';
import { TestimonialDialogService } from 'src/app/testimonial/testimonial-dialog.service';
import { BookingDialogService } from 'src/app/booking/booking-dialog.service';
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
  styleUrls: ['./trainers-details.component.css']
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

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private trainerService: TrainerService,
    private seoService: SeoService,
    private testimonialDialog: TestimonialDialogService,
    private bookingDialog: BookingDialogService
  ) { }

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

    if (!name) {
      this.resolved = true;
      this.notFound = true;
      return;
    }

    this.trainerService.getActiveTrainers()
      .pipe(take(1), catchError(() => of(null)))
      .subscribe(response => {

        const trainers = response?.data ?? [];
        const target = name.toLowerCase();
        const match = trainers.find(t => t.name?.replace(/ /g, '-').toLowerCase() === target);

        this.resolved = true;

        if (!match) {
          this.notFound = true;
          this.trainer = null;
          return;
        }

        this.trainer = match;
        this.trainerId = match.id;
        this.updateSeoTags(match);
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
   * A login gate (BookingDialogService/TestimonialDialogService) sent the
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

  /** Back to the trainers directory from the not-found state. */
  backToTrainers(): void {
    this.router.navigate(['/trainers']);
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
      })
    );
  }

  /**
   * Reuses the shared login-gated dialog trigger. The form does not support
   * pre-selecting a target, so this opens the generic form.
   */
  leaveTestimonial(): void {
    this.testimonialDialog.openTestimonialForm();
  }

  /** Opens the "Book a session" form for this trainer. */
  bookSession(): void {
    if (!this.trainer) return;
    this.bookingDialog.openBookingForm({
      trainerId: this.trainerId,
      providerName: this.trainer.name || 'this trainer'
    });
  }

  testimonialAuthor(testimonial: Testimonials): string {
    return testimonial.clientName
      || `${testimonial.userFirstname ?? ''} ${testimonial.userLastname ?? ''}`.trim()
      || 'Berliz member';
  }
}
