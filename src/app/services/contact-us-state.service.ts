import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { ContactUs, ContactUsMessage } from '../models/contact-us.model';
import { ContactUsService } from './contact-us.service';
import { SnackBarService } from './snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class ContactUsStateService {
  private allContactUsSubject = new BehaviorSubject<any>(null);
  public allContactUsData$: Observable<ContactUs[]> = this.allContactUsSubject.asObservable();
  private contactUsMessageSubject = new BehaviorSubject<any>(null);
  public contactUsMessageData$: Observable<ContactUsMessage[]> = this.contactUsMessageSubject.asObservable();
  responseMessage: any;

  constructor(private contactUsService: ContactUsService,
    private snackbarService: SnackBarService) { }

  setAllContactUsSubject(data: ContactUs[]) {
    this.allContactUsSubject.next(data);
  }

  setContactUsMessageSubject(data: ContactUsMessage[]) {
    this.contactUsMessageSubject.next(data);
  }

  getAllContactUs(): Observable<ContactUs[]> {
    return this.contactUsService.getAllContactUs().pipe(
      tap((response: any) => {
        return response.sort((a: any, b: any) => {
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

  getContactUsMessages(): Observable<ContactUsMessage[]> {
    return this.contactUsService.getContactUsMessages().pipe(
      tap((response: any) => {
        return response.sort((a: any, b: any) => {
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
