import { Injectable } from '@angular/core';
import { Partners } from '../models/partners.interface';
import { PartnerService } from './partner.service';
import { SnackBarService } from './snack-bar.service';
import { Observable, tap, catchError, of } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';

@Injectable({
  providedIn: 'root'
})
export class PartnerDataService {
  partnerData!: Partners;
  responseMessage: any;

  constructor(private partnerService: PartnerService,
    private snackbarService: SnackBarService,) { }

    ngOnInit() {
    
    }

  getPartner(): Observable<Partners> {
    return this.partnerService.getPartner().pipe(
      tap((response: any) => {
        this.partnerData = response;
      }), catchError((error: any) => {
        this.snackbarService.openSnackBar(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
        return of();
      })
    );
  }
}
