import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { NotificationService } from './notification.service';
import { SnackBarService } from './snack-bar.service';
import { Notifications } from '../models/Notifications.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationStateService {
  private myNotificationSubject = new BehaviorSubject<any>(null);
  public myNotificationData$: Observable<Notifications[]> = this.myNotificationSubject.asObservable();
  private allNotificationsSubject = new BehaviorSubject<any>(null);
  public allNotificationsData$: Observable<Notifications[]> = this.allNotificationsSubject.asObservable();
  responseMessage: any;

  constructor(private notificationService: NotificationService,
    private snackbarService: SnackBarService) { }

  setmyNotificationsSubject(data: Notifications[]) {
    this.myNotificationSubject.next(data);
  }

  setAllNotificationsSubject(data: Notifications[]) {
    this.allNotificationsSubject.next(data);
  }

  getAllNotifications(): Observable<Notifications[]> {
    return this.notificationService.getAllNotifications().pipe(
      tap((response: any) => {
        return response.sort((a: Notifications, b: Notifications) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateA - dateB;
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

  getMyNotifications(): Observable<Notifications[]> {
    return this.notificationService.getMyNotifications().pipe(
      map((response: any) => {
        return response.sort((a: Notifications, b: Notifications) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        })
      }),
      catchError((error) => {
        console.log(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
          console.log(this.responseMessage);
        } else {
          this.responseMessage = genericError;
        }
        console.log(this.responseMessage, 'error');
        return of([]);
      })
    );
  }
}

