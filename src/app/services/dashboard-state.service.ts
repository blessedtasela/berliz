import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { PartnerDetails } from '../models/dashboard.interface';
import { DashboardService } from './dashboard.service';
import { SnackBarService } from './snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {
  private dashboardSubject = new BehaviorSubject<any>(null);
  public dashboardData$: Observable<any[]> = this.dashboardSubject.asObservable();
  private berlizSubject = new BehaviorSubject<any>(null);
  public berlizData$: Observable<any[]> = this.berlizSubject.asObservable();
  private partnerDetailsSubject = new BehaviorSubject<any>(null);
  public partnerDetailsData$: Observable<PartnerDetails[]> = this.partnerDetailsSubject.asObservable();
  responseMessage: any;

  constructor(private dashboardService: DashboardService,
    private snackbarService: SnackBarService) { }

  setDashboardSubject(data: any[]) {
    this.dashboardSubject.next(data);
  }

  setBerlizSubject(data: any[]) {
    this.berlizSubject.next(data);
  }

  setPartnerDetailsSubject(data: any[]) {
    this.partnerDetailsSubject.next(data);
  }

  getDashBoard(): Observable<any[]> {
    return this.dashboardService.getDashboardDetails().pipe(
      tap((response: any) => {
        return response;
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

  getBerlizData(): Observable<any[]> {
    return this.dashboardService.getBerlizDetails().pipe(
      tap((response: any) => {
        return response;
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

  getPartnerDetails(): Observable<PartnerDetails[]> {
    return this.dashboardService.getPartnerDetails().pipe(
      tap((response: any) => {
        return response
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


