import { Injectable } from '@angular/core';
import { Partners } from '../models/partners.interface';
import { PartnerService } from './partner.service';
import { SnackBarService } from './snack-bar.service';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';

@Injectable({
  providedIn: 'root'
})
export class PartnerStateService {
  private activePartnersSubject = new BehaviorSubject<any>(null);
  public activePartnersData$: Observable<Partners[]> = this.activePartnersSubject.asObservable();
  private allPartnersSubject = new BehaviorSubject<any>(null);
  public allPartnersData$: Observable<Partners[]> = this.allPartnersSubject.asObservable();
  private partnerSubject = new BehaviorSubject<any>(null);
  public partnerData$: Observable<Partners> = this.partnerSubject.asObservable();
  responseMessage: any;

  constructor(private partnerService: PartnerService,
    private snackbarService: SnackBarService,) { }

  ngOnInit() {

  }

  setPartnerSubject(data: Partners) {
    this.partnerSubject.next(data);
  }

  setActivePartnerssSubject(data: Partners[]) {
    this.activePartnersSubject.next(data);
  }

  setAllPartnersSubject(data: Partners[]) {
    this.allPartnersSubject.next(data);
  }

  getPartner(): Observable<Partners> {
    return this.partnerService.getPartner().pipe(
      tap((response: any) => {
        return response;
      }), catchError((error: any) => {
       console.log(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        console.log(this.responseMessage, 'error');
        return of();
      })
    );
  }

  getAllPartners(): Observable<Partners[]> {
    return this.partnerService.getAllPartners().pipe(
      tap((response: any) => {
        for (const partner of response) {
          partner.cv = "data:application/pdf;base64," + partner.cv;
          partner.certificate = "data:application/pdf;base64," + partner.certificate;
        }
        return response.sort((a: Partners, b: Partners) => {
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

  getActivePartners(): Observable<Partners[]> {
    return this.partnerService.getActivePartners().pipe(
      tap((response: any) => {
        for (const partner of response) {
          partner.cv = "data:application/pdf;base64," + partner.cv;
          partner.certificate = "data:application/pdf;base64," + partner.certificate;
        }
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
}
