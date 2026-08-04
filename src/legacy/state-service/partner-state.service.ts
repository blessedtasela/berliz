// import { Injectable } from '@angular/core';
// import { Partner } from '../../app/models/partners.interface';
// import { PartnerService } from '../../app/services/partner.service';
// import { SnackBarService } from '../../app/services/snack-bar.service';
// import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
// import { genericError } from 'src/validators/form-validators.module';
// import { Trainers } from '../../app/models/trainers.interface';

// @Injectable({
//   providedIn: 'root'
// })
// export class PartnerStateService {
//   private activePartnersSubject = new BehaviorSubject<any>(null);
//   public activePartnersData$: Observable<Partner[]> = this.activePartnersSubject.asObservable();
//   private allPartnersSubject = new BehaviorSubject<any>(null);
//   public allPartnersData$: Observable<Partner[]> = this.allPartnersSubject.asObservable();
//   private partnerSubject = new BehaviorSubject<any>(null);
//   public partnerData$: Observable<Partner> = this.partnerSubject.asObservable();
//   responseMessage: any;

//   constructor(private partnerService: PartnerService,
//     private snackbarService: SnackBarService,) { }

//   ngOnInit() {

//   }

//   setPartnerSubject(data: Partner) {
//     this.partnerSubject.next(data);
//   }

//   setActivePartnerssSubject(data: Partner[]) {
//     this.activePartnersSubject.next(data);
//   }

//   setAllPartnersSubject(data: Partner[]) {
//     this.allPartnersSubject.next(data);
//   }

//   getPartner(): Observable<Partner> {
//     return this.partnerService.getPartner().pipe(
//       tap((response: any) => response),
//       catchError((error: any) => {
//         this.handleErrors(error);
//         return of();
//       })
//     );
//   }

//   getAllPartners(): Observable<Partner[]> {
//     return this.partnerService.getAllPartners().pipe(
//       tap((response: any) => {
//         for (const partner of response) {
//           partner.cv = "data:application/pdf;base64," + partner.cv;
//           partner.certificate = "data:application/pdf;base64," + partner.certificate;
//         }
//         return response.sort((a: Partner, b: Partner) => {
//           const dateA = new Date(a.date).getTime();
//           const dateB = new Date(b.date).getTime();
//           return dateB - dateA;
//         })
//       }),
//       catchError((error) => {
//         this.snackbarService.openSnackBar(error, 'error');
//         if (error.error?.message) {
//           this.responseMessage = error.error?.message;
//         } else {
//           this.responseMessage = genericError;
//         }
//         this.snackbarService.openSnackBar(this.responseMessage, 'error');
//         return of([]);
//       })
//     );
//   }

//   getActivePartners(): Observable<Partner[]> {
//     return this.partnerService.getActivePartners().pipe(
//       tap((response: any) => {
//         return response;
//       }),
//       catchError((error) => {
//         this.snackbarService.openSnackBar(error, 'error');
//         if (error.error?.message) {
//           this.responseMessage = error.error?.message;
//         } else {
//           this.responseMessage = genericError;
//         }
//         this.snackbarService.openSnackBar(this.responseMessage, 'error');
//         return of([]);
//       })
//     );
//   }

//   private handleErrors(error: any): void {
//     if (error.error?.message) {
//       this.responseMessage = error.error?.message;
//     } else {
//       this.responseMessage = genericError;
//     }
//     console.log(this.responseMessage, 'error');
//   }

// }
