import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { TrainerService } from './trainer.service';
import { SnackBarService } from './snack-bar.service';
import { TrainerBenefits, TrainerClients, TrainerFeatureVideo, TrainerIntrodution, TrainerPhotoAlbum, TrainerPricing, TrainerReview, TrainerVideoAlbum, Trainers } from '../models/trainers.interface';
import { TrainerLike } from '../models/users.interface';
import { genericError } from 'src/validators/form-validators.module';
import { CenterTrainers } from '../models/centers.interface';

@Injectable({
  providedIn: 'root'
})
export class TrainerStateService {
  private activeTrainersSubject = new BehaviorSubject<any>(null);
  public activeTrainersData$: Observable<Trainers[]> = this.activeTrainersSubject.asObservable();

  private allTrainersSubject = new BehaviorSubject<any>(null);
  public allTrainersData$: Observable<Trainers[]> = this.allTrainersSubject.asObservable();

  private trainerSubject = new BehaviorSubject<any>(null);
  public trainerData$: Observable<Trainers> = this.trainerSubject.asObservable();

  private likeTrainersSubject = new BehaviorSubject<any>(null);
  public likeTrainersData$: Observable<TrainerLike[]> = this.likeTrainersSubject.asObservable();

  private allTrainerPricingSubject = new BehaviorSubject<any>(null);
  public allTrainerPricingData$: Observable<TrainerPricing[]> = this.allTrainerPricingSubject.asObservable();

  private myTrainerPricingSubject = new BehaviorSubject<any>(null);
  public myTrainerPricingData$: Observable<TrainerPricing> = this.myTrainerPricingSubject.asObservable();

  private allTrainerIntroductionsSubject = new BehaviorSubject<any>(null);
  public allTrainerIntroductionsData$: Observable<any> = this.allTrainerIntroductionsSubject.asObservable();

  private myTrainerIntroductionSubject = new BehaviorSubject<any>(null);
  public myTrainerIntroductionData$: Observable<any> = this.myTrainerIntroductionSubject.asObservable();

  private myTrainerPhotoAlbumsSubject = new BehaviorSubject<any>(null);
  public myTrainerPhotoAlbumsData$: Observable<TrainerPhotoAlbum> = this.myTrainerPhotoAlbumsSubject.asObservable();

  private allTrainerBenefitsSubject = new BehaviorSubject<any>(null);
  public allTrainerBenefitsData$: Observable<TrainerBenefits> = this.allTrainerBenefitsSubject.asObservable();

  private myTrainerBenefitSubject = new BehaviorSubject<any>(null);
  public myTrainerBenefitData$: Observable<TrainerBenefits> = this.myTrainerBenefitSubject.asObservable();

  private myTrainerVideoAlbumsSubject = new BehaviorSubject<any | null>(null);
  public myTrainerVideoAlbumsData$: Observable<TrainerVideoAlbum> = this.myTrainerVideoAlbumsSubject.asObservable();

  private myClientsSubject = new BehaviorSubject<any>(null);
  public myClientsData$: Observable<TrainerClients> = this.myClientsSubject.asObservable();

  private myActiveClientsSubject = new BehaviorSubject<any>(null);
  public myActiveClientsData$: Observable<TrainerClients> = this.myActiveClientsSubject.asObservable();

  private myTrainerFeatureVideoSubject = new BehaviorSubject<any>(null);
  public myTrainerFeatureVideoData$: Observable<TrainerFeatureVideo> = this.myTrainerFeatureVideoSubject.asObservable();

  private allTrainerFeatureVideosSubject = new BehaviorSubject<any>(null);
  public allTrainerFeatureVideosData$: Observable<TrainerFeatureVideo[]> = this.allTrainerFeatureVideosSubject.asObservable();

  private trainerReviewLikesSubject = new BehaviorSubject<any>(null);
  public trainerReviewLikesData$: Observable<TrainerReview> = this.trainerReviewLikesSubject.asObservable();

  private myCenterTrainersSubject = new BehaviorSubject<any>(null);
  public myCenterTrainersData$: Observable<CenterTrainers> = this.myCenterTrainersSubject.asObservable();

  private myTrainerReviewsSubject = new BehaviorSubject<any>(null);
  public myTrainerReviewsData$: Observable<TrainerReview> = this.myTrainerReviewsSubject.asObservable();

  private allTrainerReviewsSubject = new BehaviorSubject<any>(null);
  public allTrainerReviewsData$: Observable<TrainerReview> = this.allTrainerReviewsSubject.asObservable();

  private activeTrainerReviewsSubject = new BehaviorSubject<any>(null);
  public activeTrainerReviewsData$: Observable<TrainerReview> = this.activeTrainerReviewsSubject.asObservable();

  responseMessage: any;

  constructor(
    private trainerService: TrainerService,
    private snackbarService: SnackBarService
  ) { }

  // Set subject methods
  setTrainerSubject(data: Trainers) {
    this.trainerSubject.next(data);
  }

  setActiveTrainersSubject(data: Trainers[]) {
    this.activeTrainersSubject.next(data);
  }

  setAllTrainersSubject(data: Trainers[]) {
    this.allTrainersSubject.next(data);
  }

  setLikeTrainersSubject(data: TrainerLike[]) {
    this.likeTrainersSubject.next(data);
  }

  setAllTrainerPricingSubject(data: TrainerPricing[]) {
    this.allTrainerPricingSubject.next(data);
  }

  setMyTrainerPricingSubject(data: TrainerPricing) {
    this.myTrainerPricingSubject.next(data);
  }

  setAllTrainerIntroductionsSubject(trainerIntroduction: TrainerIntrodution) {
    if (trainerIntroduction !== null) {
      this.allTrainerIntroductionsSubject.next(trainerIntroduction);
    }
  }

  setMyTrainerIntroductionSubject(trainerIntroduction: TrainerIntrodution) {
    if (trainerIntroduction !== null) {
      this.myTrainerIntroductionSubject.next(trainerIntroduction);
    }
  }

  setMyTrainerPhotoAlbumsSubject(data: any) {
    this.myTrainerPhotoAlbumsSubject.next(data);
  }

  setAllTrainerBenefitsSubject(trainerBenefit: TrainerBenefits) {
    if (trainerBenefit !== null) {
      this.allTrainerBenefitsSubject.next(trainerBenefit);
    }
  }

  setMyTrainerBenefitSubject(trainerBenefit: TrainerBenefits) {
    if (trainerBenefit !== null) {
      this.myTrainerBenefitSubject.next(trainerBenefit);
    }
  }

  setMyTrainerVideoAlbumsSubject(data: any) {
    this.myTrainerVideoAlbumsSubject.next(data);
  }

  setMyClientsSubject(data: any) {
    this.myClientsSubject.next(data);
  }

  setMyActiveClientsSubject(data: any) {
    this.myActiveClientsSubject.next(data);
  }

  setMyTrainerFeatureVideoSubject(trainerFeatureVideo: TrainerFeatureVideo) {
    if (trainerFeatureVideo !== null)
      this.myTrainerFeatureVideoSubject.next(trainerFeatureVideo);
  }

  setAllTrainerFeatureVideosSubject(trainerFeatureVideos: TrainerFeatureVideo) {
    if (trainerFeatureVideos !== null)
      this.allTrainerFeatureVideosSubject.next(trainerFeatureVideos);
  }

  setTrainerReviewLikesSubject(data: any) {
    this.trainerReviewLikesSubject.next(data);
  }

  setMyCenterTrainersSubject(data: any) {
    this.myCenterTrainersSubject.next(data);
  }

  setMyTrainerReviewsSubject(data: any) {
    this.myTrainerReviewsSubject.next(data);
  }

  setAllTrainerReviewsSubject(data: any) {
    this.allTrainerReviewsSubject.next(data);
  }

  setActiveTrainerReviewsSubject(data: any) {
    this.activeTrainerReviewsSubject.next(data);
  }

  getTrainer(): Observable<Trainers> {
    return this.trainerService.getTrainer().pipe(
      tap((response: any) => response),
      catchError((error: any) => {
        this.handleErrors(error);
        return of();
      })
    );
  }

  getAllTrainers(): Observable<Trainers[]> {
    return this.trainerService.getAllTrainers().pipe(
      tap((response: any) => {
        if (response) {
          this.setAllTrainersSubject(
            response.sort((a: Trainers, b: Trainers) => {
              return a.name.localeCompare(b.name)
            }));
        }
      }),
      catchError((error) => {
        this.handleErrors(error);
        return of([]);
      })
    );
  }

  getActiveTrainers(): Observable<Trainers[]> {
    return this.trainerService.getActiveTrainers().pipe(
      tap((response: any) => {
        if (response) {
          this.setActiveTrainersSubject(response.sort((a: Trainers, b: Trainers) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
          }));
        }
      }),
      catchError((error) => {
        this.handleErrors(error);
        return of([]);
      })
    );
  }

  getTrainerLikes(): Observable<TrainerLike[]> {
    return this.trainerService.getTrainerLikes().pipe(
      tap((response: any) => response),
      catchError((error) => {
        this.handleErrors(error);
        return of([]);
      })
    );
  }

  getAllTrainerPricing(): Observable<TrainerPricing[]> {
    return this.trainerService.getAllTrainerPricing().pipe(
      tap((response: any) => {
        if (response) {
          this.setAllTrainerPricingSubject(response.sort((a: TrainerPricing, b: TrainerPricing) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
          }));
        }
      }),
      catchError((error) => {
        this.handleErrors(error);
        return of([]);
      })
    );
  }

  getMyTrainerPricing(): Observable<TrainerPricing> {
    return this.trainerService.getMyTrainerPricing().pipe(
      tap((response: any) => {
        if (response) {
          this.setMyTrainerPricingSubject(response);
          return response;
        }
      }),
      catchError((error) => {
        this.handleErrors(error);
        return of();
      })
    );
  }

  getAllTrainerIntroductions(): Observable<TrainerIntrodution> {
    return this.trainerService.getAllTrainerIntroductions().pipe(
      tap((response: any) => {
        if (response) {
          this.setMyTrainerIntroductionSubject(response);
          return response;
        }
      }),
      catchError((error) => {
        this.handleErrors(error);
        return of();
      })
    );
  }

  getMyTrainerIntroduction(): Observable<TrainerIntrodution> {
    return this.trainerService.getMyTrainerIntroduction().pipe(
      tap((response: any) => {
        if (response) {
          this.setMyTrainerIntroductionSubject(response);
          return response;
        }
      }),
      catchError((error) => {
        this.handleErrors(error);
        return of();
      })
    );
  }

  getAllTrainerBenefits(): Observable<TrainerBenefits[]> {
    return this.trainerService.getAllTrainerBenefits().pipe(
      tap((response: any) => {
        if (response) {
          this.setAllTrainerBenefitsSubject(response.sort((a: TrainerBenefits, b: TrainerBenefits) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
          }));
        }
      }),
      catchError((error) => {
        this.handleErrors(error);
        return of([]);
      })
    );
  }

  getMyTrainerBenefits(): Observable<TrainerBenefits> {
    return this.trainerService.getMyTrainerBenefits().pipe(
      tap((response: any) => {
        if (response) {
          this.setMyTrainerBenefitSubject(response);
          return response;
        }
      }),
      catchError((error) => {
        this.handleErrors(error);
        return of();
      })
    );
  }

  getAllTrainerFeatureVideos(): Observable<TrainerFeatureVideo[]> {
    return this.trainerService.getAllTrainerFeatureVideos().pipe(
      tap((response: any) => {
        if (response) {
          this.setAllTrainerFeatureVideosSubject(response.sort((a: TrainerFeatureVideo, b: TrainerFeatureVideo) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
          }));
        }
      }),
      catchError((error) => {
        this.handleErrors(error);
        return of([]);
      })
    );
  }

  getMyTrainerFeatureVideo(): Observable<TrainerFeatureVideo> {
    return this.trainerService.getMyTrainerFeatureVideo().pipe(
      tap((response: any) => {
        if (response) {
          this.setMyTrainerBenefitSubject(response);
          return response;
        }
      }),
      catchError((error) => {
        this.handleErrors(error);
        return of();
      })
    );
  }

  private handleErrors(error: any): void {
    if (error.error?.message) {
      this.responseMessage = error.error?.message;
    } else {
      this.responseMessage = genericError;
    }
    console.log(this.responseMessage, 'error');
  }

}
