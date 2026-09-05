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
import { TestimonialDialogService } from 'src/app/testimonial/testimonial-dialog.service';
import { BookingDialogService } from 'src/app/booking/booking-dialog.service';
import { loadTestimonialsByTrainer } from 'src/app/state/testimonial/testimonial.actions';
import { selectTestimonialsByTrainer } from 'src/app/state/testimonial/testimonial.selectors';
import {
  loadActiveTrainerFeatureVideos,
  loadActiveTrainerReviews,
  loadTrainerBenefits,
  loadTrainerIntroductions,
  loadTrainerPhotoAlbums,
  loadTrainerPricing,
  loadTrainerVideoAlbums
} from 'src/app/state/trainer/trainer.actions';
import {
  selectActiveTrainerFeatureVideos,
  selectActiveTrainerReviews,
  selectTrainerBenefits,
  selectTrainerIntroductions,
  selectTrainerPhotoAlbums,
  selectTrainerPricing,
  selectTrainerVideoAlbums
} from 'src/app/state/trainer/trainer.selector';

/**
 * PUBLIC trainer profile page — route `/trainers/:name`.
 *
 * `:name` is the trainer name slugified with dashes (same convention the
 * TrainerGuard uses). We resolve the slug back to the real `Trainers` record,
 * then pull every public sub-entity for that trainer id.
 *
 * NOTE: the backend only exposes "load all" endpoints for introduction /
 * benefits / pricing / photo album / video album, so those are dispatched as
 * the global load actions and filtered client-side by `trainerId`. Feature
 * videos and reviews already have trainer-scoped endpoints and are used as-is.
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
        // Compare case-insensitively: the route param arrives lowercased by
        // UrlLowerCaseSerializer on refresh/direct-load, but trainer.name
        // keeps its original casing — a case-sensitive match here 404s any
        // mixed-case name specifically (and only) on refresh.
        const match = trainers.find(t => t.name?.replace(/ /g, '-').toLowerCase() === name.toLowerCase());

        this.resolved = true;

        if (!match) {
          this.notFound = true;
          this.trainer = null;
          return;
        }

        this.trainer = match;
        this.trainerId = match.id;
        this.loadPublicProfile();
      });
  }

  /** Back to the trainers directory from the not-found state. */
  backToTrainers(): void {
    this.router.navigate(['/trainers']);
  }

  // ── Data ──────────────────────────────────────────────────────────────────

  private loadPublicProfile(): void {

    const id = this.trainerId;

    // "Load all" endpoints — filtered client-side by trainerId.
    this.store.dispatch(loadTrainerIntroductions());
    this.store.dispatch(loadTrainerBenefits());
    this.store.dispatch(loadTrainerPricing());
    this.store.dispatch(loadTrainerPhotoAlbums());
    this.store.dispatch(loadTrainerVideoAlbums());

    // Already trainer-scoped on the backend.
    this.store.dispatch(loadActiveTrainerFeatureVideos({ trainerId: id }));
    this.store.dispatch(loadActiveTrainerReviews({ id }));
    this.store.dispatch(loadTestimonialsByTrainer({ trainerId: id }));

    this.subs.push(
      this.store.select(selectTrainerIntroductions).subscribe(list => {
        this.trainerIntroduction = (list ?? []).find(i => i.trainerId === id) ?? null;
      }),

      this.store.select(selectTrainerBenefits).subscribe(list => {
        this.trainerBenefits = (list ?? []).find(b => b.trainerId === id) ?? null;
      }),

      this.store.select(selectTrainerPricing).subscribe(list => {
        this.trainerPricing = (list ?? []).find(p => p.trainerId === id) ?? null;
      }),

      this.store.select(selectTrainerPhotoAlbums).subscribe(list => {
        this.trainerPhotoAlbum = (list ?? []).find(a => a.trainerId === id) ?? null;
      }),

      this.store.select(selectTrainerVideoAlbums).subscribe(list => {
        this.trainerVideoAlbum = (list ?? []).find(a => a.trainerId === id) ?? null;
      }),

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
