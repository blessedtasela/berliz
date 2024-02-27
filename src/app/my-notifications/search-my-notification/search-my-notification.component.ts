import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Notifications } from 'src/app/models/Notifications.interface';
import { NotificationStateService } from 'src/app/services/notification-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-search-my-notification',
  templateUrl: './search-my-notification.component.html',
  styleUrls: ['./search-my-notification.component.css']
})
export class SearchMyNotificationComponent {
  myNotifications: Notifications[] = [];
  searchQuery: string = '';
  filteredMyNotifications: Notifications[] = [];
  @Output() results: EventEmitter<Notifications[]> = new EventEmitter<Notifications[]>()

  constructor(private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private notificationStateService: NotificationStateService,
    private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this.notificationStateService.myNotificationData$.subscribe((cachedData) => {
      this.myNotifications = cachedData;
    });
  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }

  initializeSearch(): void {
    fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap(() => {
          this.ngxService.start();
        }),
        switchMap((query: string) => {
          return this.search(query);
        })
      )
      .subscribe(
        (results: Notifications[]) => {
          this.ngxService.stop();
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  search(query: string): Observable<Notifications[]> {
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredMyNotifications = this.myNotifications;
    } else {
      this.filteredMyNotifications = this.myNotifications.filter((notification: Notifications) => {
        return notification.notification.toLowerCase().includes(query);
      });
    }
    return of(this.filteredMyNotifications);
  }


}


