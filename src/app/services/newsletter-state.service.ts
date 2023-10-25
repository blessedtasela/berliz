import { Injectable } from '@angular/core';
import { NewsletterService } from './newsletter.service';
import { Newsletter, NewsletterMessage } from '../models/newsletter.model';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { SnackBarService } from './snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class NewsletterStateService {
  private allNewsletterSubject = new BehaviorSubject<any>(null);
  public allNewsletterData$: Observable<Newsletter[]> = this.allNewsletterSubject.asObservable();
  private newsletterMessageSubject = new BehaviorSubject<any>(null);
  public newsletterMessageData$: Observable<NewsletterMessage[]> = this.newsletterMessageSubject.asObservable();
  responseMessage: any;

  constructor(private newsletterService: NewsletterService,
    private snackbarService: SnackBarService) { }

  setAllNewsletterSubject(data: Newsletter[]) {
    this.allNewsletterSubject.next(data);
  }

  setNewsletterMessageSubject(data: NewsletterMessage[]) {
    this.newsletterMessageSubject.next(data);
  }

  getAllNewsletters(): Observable<Newsletter[]> {
    return this.newsletterService.getAllNewsletters().pipe(
      tap((response: any) => {
        return response.sort((a: Newsletter, b: Newsletter) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
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

  getNewsletterMessages(): Observable<NewsletterMessage[]> {
    return this.newsletterService.getNewsletterMessages().pipe(
      tap((response: any) => {
        return response.sort((a: Newsletter, b: Newsletter) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
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
}
