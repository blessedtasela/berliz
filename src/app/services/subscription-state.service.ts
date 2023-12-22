import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { SnackBarService } from './snack-bar.service';
import { SubscriptionService } from './subscription.service';
import { Subscriptions } from '../models/subscriptions.interface';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionStateService {
  private activeSubscriptionsSubject = new BehaviorSubject<any>(null);
  public activeSubscriptionsData$: Observable<Subscriptions[]> = this.activeSubscriptionsSubject.asObservable();
  private allSubscriptionsSubject = new BehaviorSubject<any>(null);
  public allSubscriptionsData$: Observable<Subscriptions[]> = this.allSubscriptionsSubject.asObservable();
  private subscriptionSubject = new BehaviorSubject<any>(null);
  public subscriptionData$: Observable<Subscriptions> = this.subscriptionSubject.asObservable();
  responseMessage: any;

  constructor(private subscriptionService: SubscriptionService,
    private snackbarService: SnackBarService) { }

  setSubscritionSubject(data: Subscriptions) {
    this.subscriptionSubject.next(data);
  }

  setActiveSubscriptionsSubject(data: Subscriptions[]) {
    this.activeSubscriptionsSubject.next(data);
  }

  setAllSubscriptionsSubject(data: Subscriptions[]) {
    this.allSubscriptionsSubject.next(data);
  }


  getSubscription(): Observable<Subscriptions> {
    return this.subscriptionService.getSubscription().pipe(
      tap((response: any) => {
        return response;
      }), catchError((error: any) => {
        console.log(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
          console.log(this.responseMessage, 'error');
        } else {
          console.log(genericError)
        }
        return of();
      })
    );
  }

  getAllSubscriptions(): Observable<Subscriptions[]> {
    return this.subscriptionService.getAllSubscriptions().pipe(
      tap((response: any) => {
        return response.sort((a: Subscriptions, b: Subscriptions) => {
          return a.user.email.localeCompare(b.user.email);
        })
      }),
      catchError((error) => {
        this.snackbarService.openSnackBar(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
        return of([]);
      })
    );
  }

  getActiveSubscriptions(): Observable<Subscriptions[]> {
    return this.subscriptionService.getActiveSubscriptions().pipe(
      tap((response: any) => {
        return response.sort((a: Subscriptions, b: Subscriptions) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        })
      }),
      catchError((error) => {
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        console.log(this.responseMessage, 'error');
        return of([]);
      })
    );
  }

}

