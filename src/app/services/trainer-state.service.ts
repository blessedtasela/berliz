import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';

import { TrainerService } from './trainer.service';
import { SnackBarService } from './snack-bar.service';

import {
  TrainerBenefits,
  TrainerClients,
  TrainerFeatureVideo,
  TrainerIntroduction,
  TrainerPhotoAlbum,
  TrainerPricing,
  TrainerReview,
  TrainerSubscription,
  TrainerTestimonials,
  TrainerVideoAlbum,
  Trainers,
} from '../models/trainers.interface';

import { TrainerLikes } from '../models/trainers.interface';
import { CenterTrainers } from '../models/centers.interface';

@Injectable({ providedIn: 'root' })
export class TrainerStateService {

  // ─── Trainers ────────────────────────────────────────────────────────────────

  private activeTrainersSubject = new BehaviorSubject<Trainers[] | null>(null);
  activeTrainersData$: Observable<Trainers[] | null> = this.activeTrainersSubject.asObservable();

  private allTrainersSubject = new BehaviorSubject<Trainers[] | null>(null);
  allTrainersData$: Observable<Trainers[] | null> = this.allTrainersSubject.asObservable();

  private trainerSubject = new BehaviorSubject<Trainers | null>(null);
  trainerData$: Observable<Trainers | null> = this.trainerSubject.asObservable();

  // ─── Trainer Likes (users who liked the trainer) ─────────────────────────────

  private likeTrainersSubject = new BehaviorSubject<TrainerLikes[] | null>(null);
  likeTrainersData$: Observable<TrainerLikes[] | null> = this.likeTrainersSubject.asObservable();

  private myTrainerLikesSubject = new BehaviorSubject<TrainerLikes[] | null>(null);
  myTrainerLikesData$: Observable<TrainerLikes[] | null> = this.myTrainerLikesSubject.asObservable();

  private allTrainerLikesSubject = new BehaviorSubject<TrainerLikes[] | null>(null);
  allTrainerLikessData$: Observable<TrainerLikes[] | null> = this.allTrainerLikesSubject.asObservable();

  // ─── Pricing ─────────────────────────────────────────────────────────────────

  private allTrainerPricingSubject = new BehaviorSubject<TrainerPricing[] | null>(null);
  allTrainerPricingData$: Observable<TrainerPricing[] | null> = this.allTrainerPricingSubject.asObservable();

  private myTrainerPricingSubject = new BehaviorSubject<TrainerPricing | null>(null);
  myTrainerPricingData$: Observable<TrainerPricing | null> = this.myTrainerPricingSubject.asObservable();

  // ─── Introduction ─────────────────────────────────────────────────────────────

  private allTrainerIntroductionsSubject = new BehaviorSubject<TrainerIntroduction | null>(null);
  allTrainerIntroductionsData$: Observable<TrainerIntroduction | null> = this.allTrainerIntroductionsSubject.asObservable();

  private myTrainerIntroductionSubject = new BehaviorSubject<TrainerIntroduction | null>(null);
  myTrainerIntroductionData$: Observable<TrainerIntroduction | null> = this.myTrainerIntroductionSubject.asObservable();

  // ─── Benefits ─────────────────────────────────────────────────────────────────

  private allTrainerBenefitsSubject = new BehaviorSubject<TrainerBenefits | null>(null);
  allTrainerBenefitsData$: Observable<TrainerBenefits | null> = this.allTrainerBenefitsSubject.asObservable();

  private myTrainerBenefitSubject = new BehaviorSubject<TrainerBenefits | null>(null);
  myTrainerBenefitData$: Observable<TrainerBenefits | null> = this.myTrainerBenefitSubject.asObservable();

  // ─── Feature Video ───────────────────────────────────────────────────────────

  private allTrainerFeatureVideosSubject = new BehaviorSubject<TrainerFeatureVideo[] | null>(null);
  allTrainerFeatureVideosData$: Observable<TrainerFeatureVideo[] | null> = this.allTrainerFeatureVideosSubject.asObservable();

  private myTrainerFeatureVideoSubject = new BehaviorSubject<TrainerFeatureVideo[] | null>(null);
  myTrainerFeatureVideoData$: Observable<TrainerFeatureVideo[] | null> = this.myTrainerFeatureVideoSubject.asObservable();

  // ─── Photo Album ─────────────────────────────────────────────────────────────

  private allTrainerPhotoAlbumsSubject = new BehaviorSubject<TrainerPhotoAlbum | null>(null);
  allTrainerPhotoAlbumsData$: Observable<TrainerPhotoAlbum | null> = this.allTrainerPhotoAlbumsSubject.asObservable();

  private myTrainerPhotoAlbumsSubject = new BehaviorSubject<TrainerPhotoAlbum | null>(null);
  myTrainerPhotoAlbumsData$: Observable<TrainerPhotoAlbum | null> = this.myTrainerPhotoAlbumsSubject.asObservable();

  // ─── Video Album ─────────────────────────────────────────────────────────────

  private myTrainerVideoAlbumsSubject = new BehaviorSubject<TrainerVideoAlbum | null>(null);
  myTrainerVideoAlbumsData$: Observable<TrainerVideoAlbum | null> = this.myTrainerVideoAlbumsSubject.asObservable();

  // ─── Clients ─────────────────────────────────────────────────────────────────

  private myClientsSubject = new BehaviorSubject<TrainerClients[] | null>(null);
  myClientsData$: Observable<TrainerClients[] | null> = this.myClientsSubject.asObservable();

  private myActiveClientsSubject = new BehaviorSubject<TrainerClients[] | null>(null);
  myActiveClientsData$: Observable<TrainerClients[] | null> = this.myActiveClientsSubject.asObservable();

  // ─── Subscriptions ───────────────────────────────────────────────────────────

  private myTrainerSubscriptionsSubject = new BehaviorSubject<TrainerSubscription[] | null>(null);
  myTrainerSubscriptionsData$: Observable<TrainerSubscription[] | null> = this.myTrainerSubscriptionsSubject.asObservable();

  // ─── Reviews ─────────────────────────────────────────────────────────────────

  private myTrainerReviewsSubject = new BehaviorSubject<TrainerReview[] | null>(null);
  myTrainerReviewsData$: Observable<TrainerReview[] | null> = this.myTrainerReviewsSubject.asObservable();

  private allTrainerReviewsSubject = new BehaviorSubject<TrainerReview[] | null>(null);
  allTrainerReviewsData$: Observable<TrainerReview[] | null> = this.allTrainerReviewsSubject.asObservable();

  private activeTrainerReviewsSubject = new BehaviorSubject<TrainerReview[] | null>(null);
  activeTrainerReviewsData$: Observable<TrainerReview[] | null> = this.activeTrainerReviewsSubject.asObservable();

  private trainerReviewLikesSubject = new BehaviorSubject<TrainerReview | null>(null);
  trainerReviewLikesData$: Observable<TrainerReview | null> = this.trainerReviewLikesSubject.asObservable();

  // ─── Testimonials ────────────────────────────────────────────────────────────

  private myTrainerTestimonialsSubject = new BehaviorSubject<TrainerTestimonials[] | null>(null);
  myTrainerTestimonialsData$: Observable<TrainerTestimonials[] | null> = this.myTrainerTestimonialsSubject.asObservable();

  // ─── Center Trainers ─────────────────────────────────────────────────────────

  private myCenterTrainersSubject = new BehaviorSubject<CenterTrainers | null>(null);
  myCenterTrainersData$: Observable<CenterTrainers | null> = this.myCenterTrainersSubject.asObservable();

  // ─────────────────────────────────────────────────────────────────────────────

  private responseMessage: string = '';

  constructor(
    private trainerService: TrainerService,
    private snackbarService: SnackBarService
  ) { }

  // ─── Setters ─────────────────────────────────────────────────────────────────

  setTrainerSubject(data: Trainers): void { this.trainerSubject.next(data); }
  setActiveTrainersSubject(data: Trainers[]): void { this.activeTrainersSubject.next(data); }
  setAllTrainersSubject(data: Trainers[]): void { this.allTrainersSubject.next(data); }

  setLikeTrainersSubject(data: TrainerLikes[]): void { this.likeTrainersSubject.next(data); }
  setMyTrainerLikesSubject(data: TrainerLikes[]): void { this.myTrainerLikesSubject.next(data); }
  setAllTrainerLikesSubject(data: TrainerLikes[]): void { this.allTrainerLikesSubject.next(data); }

  setAllTrainerPricingSubject(data: TrainerPricing[]): void { this.allTrainerPricingSubject.next(data); }
  setMyTrainerPricingSubject(data: TrainerPricing): void { this.myTrainerPricingSubject.next(data); }

  setAllTrainerIntroductionsSubject(data: TrainerIntroduction): void { this.allTrainerIntroductionsSubject.next(data); }
  setMyTrainerIntroductionSubject(data: TrainerIntroduction): void { this.myTrainerIntroductionSubject.next(data); }

  setAllTrainerBenefitsSubject(data: TrainerBenefits): void { this.allTrainerBenefitsSubject.next(data); }
  setMyTrainerBenefitSubject(data: TrainerBenefits): void { this.myTrainerBenefitSubject.next(data); }

  setAllTrainerFeatureVideosSubject(data: TrainerFeatureVideo[]): void { this.allTrainerFeatureVideosSubject.next(data); }
  setMyTrainerFeatureVideoSubject(data: TrainerFeatureVideo[]): void { this.myTrainerFeatureVideoSubject.next(data); }

  setAllTrainerPhotoAlbumsSubject(data: TrainerPhotoAlbum): void { this.allTrainerPhotoAlbumsSubject.next(data); }
  setMyTrainerPhotoAlbumsSubject(data: TrainerPhotoAlbum): void { this.myTrainerPhotoAlbumsSubject.next(data); }

  setMyTrainerVideoAlbumsSubject(data: TrainerVideoAlbum): void { this.myTrainerVideoAlbumsSubject.next(data); }

  setMyClientsSubject(data: TrainerClients[]): void { this.myClientsSubject.next(data); }
  setMyActiveClientsSubject(data: TrainerClients[]): void { this.myActiveClientsSubject.next(data); }

  setMyTrainerSubscriptionsSubject(data: TrainerSubscription[]): void { this.myTrainerSubscriptionsSubject.next(data); }

  setMyTrainerReviewsSubject(data: TrainerReview[]): void { this.myTrainerReviewsSubject.next(data); }
  setAllTrainerReviewsSubject(data: TrainerReview[]): void { this.allTrainerReviewsSubject.next(data); }
  setActiveTrainerReviewsSubject(data: TrainerReview[]): void { this.activeTrainerReviewsSubject.next(data); }
  setTrainerReviewLikesSubject(data: TrainerReview): void { this.trainerReviewLikesSubject.next(data); }

  setMyTrainerTestimonialsSubject(data: TrainerTestimonials[]): void { this.myTrainerTestimonialsSubject.next(data); }

  setMyCenterTrainersSubject(data: CenterTrainers): void { this.myCenterTrainersSubject.next(data); }

  // ─── Getters (API calls) ─────────────────────────────────────────────────────

  getTrainer(): Observable<Trainers> {
    return this.trainerService.getTrainer().pipe(
      tap((res: Trainers) => { if (res) this.setTrainerSubject(res); }),
      catchError(err => { this.handleError(err); return of(); })
    );
  }

  getAllTrainers(): Observable<Trainers[]> {
    return this.trainerService.getAllTrainers().pipe(
      tap((res: Trainers[]) => {
        if (res) this.setAllTrainersSubject(
          res.sort((a, b) => a.name.localeCompare(b.name))
        );
      }),
      catchError(err => { this.handleError(err); return of([]); })
    );
  }

  getActiveTrainers(): Observable<Trainers[]> {
    return this.trainerService.getActiveTrainers().pipe(
      tap((res: Trainers[]) => {
        if (res) this.setActiveTrainersSubject(
          res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
      }),
      catchError(err => { this.handleError(err); return of([]); })
    );
  }

  getAllTrainerLikes(): Observable<TrainerLikes[]> {
    return this.trainerService.getAllTrainerLikes().pipe(
      tap((res: TrainerLikes[]) => { if (res) this.setAllTrainerLikesSubject(res); }),
      catchError(err => { this.handleError(err); return of([]); })
    );
  }

  getMyTrainerLikes(): Observable<TrainerLikes[]> {
    return this.trainerService.getMyTrainerLikes().pipe(
      tap((res: TrainerLikes[]) => { if (res) this.setMyTrainerLikesSubject(res); }),
      catchError(err => { this.handleError(err); return of([]); })
    );
  }

  getAllTrainerPricing(): Observable<TrainerPricing[]> {
    return this.trainerService.getAllTrainerPricing().pipe(
      tap((res: TrainerPricing[]) => {
        if (res) this.setAllTrainerPricingSubject(
          res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
      }),
      catchError(err => { this.handleError(err); return of([]); })
    );
  }

  getMyTrainerPricing(): Observable<TrainerPricing> {
    return this.trainerService.getMyTrainerPricing().pipe(
      tap((res: TrainerPricing) => { if (res) this.setMyTrainerPricingSubject(res); }),
      catchError(err => { this.handleError(err); return of(); })
    );
  }

  getAllTrainerIntroductions(): Observable<TrainerIntroduction> {
    return this.trainerService.getAllTrainerIntroductions().pipe(
      tap((res: TrainerIntroduction) => { if (res) this.setAllTrainerIntroductionsSubject(res); }),
      catchError(err => { this.handleError(err); return of(); })
    );
  }

  getMyTrainerIntroduction(): Observable<TrainerIntroduction> {
    return this.trainerService.getMyTrainerIntroduction().pipe(
      tap((res: TrainerIntroduction) => { if (res) this.setMyTrainerIntroductionSubject(res); }),
      catchError(err => { this.handleError(err); return of(); })
    );
  }

  getAllTrainerBenefits(): Observable<TrainerBenefits[]> {
    return this.trainerService.getAllTrainerBenefits().pipe(
      tap((res: TrainerBenefits[]) => {
        if (res) this.setAllTrainerBenefitsSubject(
          res.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) as any
        );
      }),
      catchError(err => { this.handleError(err); return of([]); })
    );
  }

  getMyTrainerBenefits(): Observable<TrainerBenefits> {
    return this.trainerService.getMyTrainerBenefits().pipe(
      tap((res: TrainerBenefits) => { if (res) this.setMyTrainerBenefitSubject(res); }),
      catchError(err => { this.handleError(err); return of(); })
    );
  }

  getAllTrainerFeatureVideos(): Observable<TrainerFeatureVideo[]> {
    return this.trainerService.getAllTrainerFeatureVideos().pipe(
      tap((res: TrainerFeatureVideo[]) => {
        if (res) this.setAllTrainerFeatureVideosSubject(
          res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
      }),
      catchError(err => { this.handleError(err); return of([]); })
    );
  }

  getMyTrainerFeatureVideos(): Observable<TrainerFeatureVideo[]> {
    return this.trainerService.getMyTrainerFeatureVideos().pipe(
      tap((res: TrainerFeatureVideo[]) => {
        if (res) this.setMyTrainerFeatureVideoSubject(
          res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
      }),
      catchError(err => { this.handleError(err); return of([]); })
    );
  }

  getAllTrainerPhotoAlbums(): Observable<TrainerPhotoAlbum[]> {
    return this.trainerService.getAllTrainerPhotoAlbums().pipe(
      tap((res: TrainerPhotoAlbum[]) => {
        if (res) this.setAllTrainerPhotoAlbumsSubject(
          res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as any
        );
      }),
      catchError(err => { this.handleError(err); return of([]); })
    );
  }

  getMyTrainerPhotoAlbum(): Observable<TrainerPhotoAlbum> {
    return this.trainerService.getMyTrainerPhotosAlbum().pipe(
      tap((res: TrainerPhotoAlbum) => { if (res) this.setMyTrainerPhotoAlbumsSubject(res); }),
      catchError(err => { this.handleError(err); return of(); })
    );
  }

  getMyTrainerVideoAlbum(): Observable<TrainerVideoAlbum> {
    return this.trainerService.getMyTrainerVideosAlbum().pipe(
      tap((res: TrainerVideoAlbum) => { if (res) this.setMyTrainerVideoAlbumsSubject(res); }),
      catchError(err => { this.handleError(err); return of(); })
    );
  }

  getMyTrainerClients(): Observable<TrainerClients[]> {
    return this.trainerService.getMyTrainerClients().pipe(
      tap((res: TrainerClients[]) => {
        if (res) {
          this.setMyClientsSubject(res);
          this.setMyActiveClientsSubject(
            res.filter((c: any) => c.status === 'active')
          );
        }
      }),
      catchError(err => { this.handleError(err); return of([]); })
    );
  }

  getMyTrainerSubscriptions(): Observable<TrainerSubscription[]> {
    return this.trainerService.getMyTrainerSubscriptions().pipe(
      tap((res: TrainerSubscription[]) => {
        if (res) this.setMyTrainerSubscriptionsSubject(
          res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
      }),
      catchError(err => { this.handleError(err); return of([]); })
    );
  }

  getMyTrainerReviews(): Observable<TrainerReview[]> {
    return this.trainerService.getMyTrainerReviews().pipe(
      tap((res: TrainerReview[]) => {
        if (res) this.setMyTrainerReviewsSubject(
          res.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())
        );
      }),
      catchError(err => { this.handleError(err); return of([]); })
    );
  }

  getAllTrainerReviews(): Observable<TrainerReview[]> {
    return this.trainerService.getAllTrainerReviews().pipe(
      tap((res: TrainerReview[]) => {
        if (res) this.setAllTrainerReviewsSubject(
          res.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())
        );
      }),
      catchError(err => { this.handleError(err); return of([]); })
    );
  }

  getActiveTrainerReviews(): Observable<TrainerReview[]> {
    return this.trainerService.getActiveTrainerReviews().pipe(
      tap((res: TrainerReview[]) => { if (res) this.setActiveTrainerReviewsSubject(res); }),
      catchError(err => { this.handleError(err); return of([]); })
    );
  }

  getMyTrainerTestimonials(): Observable<TrainerTestimonials[]> {
    return this.trainerService.getMyTrainerTestimonials().pipe(
      tap((res: TrainerTestimonials[]) => {
        if (res) this.setMyTrainerTestimonialsSubject(
          res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
      }),
      catchError(err => { this.handleError(err); return of([]); })
    );
  }

  // ─── Error handler ───────────────────────────────────────────────────────────

  private handleError(error: any): void {
    this.responseMessage = error?.error?.message ?? genericError;
    console.error(this.responseMessage, error);
  }
}