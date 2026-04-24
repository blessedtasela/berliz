import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { NotificationService } from './notification.service';
import { SnackBarService } from './snack-bar.service';
import { Notifications } from '../models/Notifications.interface';
import { FilterState } from '../models/FilterState.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationStateService {

  private myNotificationSubject = new BehaviorSubject<Notifications[]>([]);
  public myNotificationData$ = this.myNotificationSubject.asObservable();

  private allNotificationsSubject = new BehaviorSubject<Notifications[]>([]);
  public allNotificationsData$ = this.allNotificationsSubject.asObservable();

  responseMessage: any;

  constructor(
    private notificationService: NotificationService,
    private snackbarService: SnackBarService
  ) { }

  // SETTERS
  setMyNotifications(data: Notifications[]) {
    this.myNotificationSubject.next(data);
  }

  setAllNotifications(data: Notifications[]) {
    this.allNotificationsSubject.next(data);
  }

  // API CALLS
  getAllNotifications(): Observable<Notifications[]> {
    return this.notificationService.getAllNotifications().pipe(
      map((response: Notifications[]) =>
        response.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      ),
      catchError(error => {
        this.handleError(error);
        return of([]);
      })
    );
  }

  getMyNotifications(): Observable<Notifications[]> {
    return this.notificationService.getMyNotifications().pipe(
      map((response: Notifications[]) =>
        response.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      ),
      catchError(error => {
        this.handleError(error);
        return of([]);
      })
    );
  }

  private handleError(error: any) {
    if (error.error?.message) {
      this.responseMessage = error.error.message;
    } else {
      this.responseMessage = genericError;
    }
    this.snackbarService.openSnackBar(this.responseMessage, 'error');
  }

  // FILTERING LOGIC
  filter(state: FilterState): Notifications[] {
    let list = [...(this.myNotificationSubject.value ?? [])];

    // -----------------------------
    // TEXT SEARCH
    // -----------------------------
    if (state.query?.trim()) {
      const words = state.query
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 0);

      list = list.filter(n => {
        const text = n.notification.toLowerCase();
        return words.every(w => text.includes(w));
      });
    }


    // -----------------------------
    // EXACT DATE FILTER
    // -----------------------------
    if (state.selectedSorts?.includes('exact-date') && state.exactDate) {
      const target = new Date(state.exactDate).setHours(0, 0, 0, 0);

      list = list.filter(n => {
        const d = new Date(n.date).setHours(0, 0, 0, 0);
        return d === target;
      });
    }

    // -----------------------------
    // DATE RANGE FILTER
    // -----------------------------
    if (
      state.selectedSorts?.includes('range') &&
      state.startDate &&
      state.endDate
    ) {
      const start = new Date(state.startDate).setHours(0, 0, 0, 0);
      const end = new Date(state.endDate).setHours(23, 59, 59, 999);

      list = list.filter(n => {
        const d = new Date(n.date).getTime();
        return d >= start && d <= end;
      });
    }

    // -----------------------------
    // SORTING
    // -----------------------------
    if (state.selectedSorts?.includes('sort-by-date')) {
      list = list.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }

    return list;
  }


  private applySortFilters(list: Notifications[], state: FilterState): Notifications[] {
    const now = new Date();
    const normalize = (d: Date) => new Date(d.setHours(0, 0, 0, 0)).getTime();

    const today = normalize(new Date());
    const yesterday = normalize(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));

    return list.filter(n => {
      const baseDate = new Date(n.date);
      const itemDate = normalize(baseDate);

      return state.selectedSorts.some(sort => {
        switch (sort) {
          case 'all': return true;
          case 'unread': return !n.read;
          case 'read': return n.read;
          case 'today': return itemDate === today;
          case 'yesterday': return itemDate === yesterday;
          case 'week': return (now.getTime() - baseDate.getTime()) <= 7 * 86400000;
          case 'month': return baseDate.getMonth() === now.getMonth();
          case 'recent': return (now.getTime() - baseDate.getTime()) <= 3 * 86400000;
          default: return false;
        }
      });
    });
  }

  private applyDateRange(list: Notifications[], start: string, end: string): Notifications[] {
    const s = new Date(start);
    const e = new Date(end);

    return list.filter(n => {
      const d = new Date(n.date);
      return d >= s && d <= e;
    });
  }
}
