import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { CenterLike } from '../models/centers.interface';
import { Payments } from '../models/payment.interface';
import { SnackBarService } from './snack-bar.service';
import { PaymentService } from './payment.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentStateService {
  private activePaymentsSubject = new BehaviorSubject<any>(null);
  public activePaymentsData$: Observable<Payments[]> = this.activePaymentsSubject.asObservable();
  private allPaymentsSubject = new BehaviorSubject<any>(null);
  public allPaymentsData$: Observable<Payments[]> = this.allPaymentsSubject.asObservable();
  private paymentSubject = new BehaviorSubject<any>(null);
  public paymentData$: Observable<Payments> = this.paymentSubject.asObservable();
  responseMessage: any;

  constructor(private paymentService: PaymentService,
    private snackbarService: SnackBarService) { }

  setPaymentSubject(data: Payments) {
    this.paymentSubject.next(data);
  }

  setActivePaymentsSubject(data: Payments[]) {
    this.activePaymentsSubject.next(data);
  }

  setAllPaymentsSubject(data: Payments[]) {
    this.allPaymentsSubject.next(data);
  }


  getPayment(): Observable<Payments> {
    return this.paymentService.getPayment().pipe(
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

  getAllPayments(): Observable<Payments[]> {
    return this.paymentService.getAllPayments().pipe(
      tap((response: any) => {
        return response.sort((a: Payments, b: Payments) => {
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

  getActivePayments(): Observable<Payments[]> {
    return this.paymentService.getActivePayments().pipe(
      tap((response: any) => {
        return response.sort((a: Payments, b: Payments) => {
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
