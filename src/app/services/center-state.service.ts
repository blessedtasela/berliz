import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { CenterLike, Centers } from '../models/centers.interface';
import { SnackBarService } from './snack-bar.service';
import { CenterService } from './center.service';

@Injectable({
  providedIn: 'root'
})
export class CenterStateService {
  private activeCentersSubject = new BehaviorSubject<any>(null);
  public activeCentersData$: Observable<Centers[]> = this.activeCentersSubject.asObservable();
  private allCentersSubject = new BehaviorSubject<any>(null);
  public allCentersData$: Observable<Centers[]> = this.allCentersSubject.asObservable();
  private centerSubject = new BehaviorSubject<any>(null);
  public centerData$: Observable<Centers> = this.centerSubject.asObservable();
  private likeCentersSubject = new BehaviorSubject<any>(null);
  public likeCentersData$: Observable<CenterLike[]> = this.likeCentersSubject.asObservable();
  responseMessage: any;



  constructor(private centerService: CenterService,
    private snackbarService: SnackBarService) { }

  setCenterSubject(data: Centers) {
    this.centerSubject.next(data);
  }

  setActiveCentersSubject(data: Centers[]) {
    this.activeCentersSubject.next(data);
  }

  setAllCentersSubject(data: Centers[]) {
    this.allCentersSubject.next(data);
  }

  setLikeCentersSubject(data: CenterLike[]) {
    this.likeCentersSubject.next(data);
  }


  getCenter(): Observable<Centers> {
    return this.centerService.getCenter().pipe(
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

  getAllCenters(): Observable<Centers[]> {
    return this.centerService.getAllCenters().pipe(
      tap((response: any) => {
        return response.sort((a: Centers, b: Centers) => {
          return a.name.localeCompare(b.name);
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

  getActiveCenters(): Observable<Centers[]> {
    return this.centerService.getActiveCenters().pipe(
      tap((response: any) => {
        return response.sort((a: Centers, b: Centers) => {
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

  getCenterLikes(): Observable<CenterLike[]> {
    return this.centerService.getCenterLikes().pipe(
      tap((response: any) => {
        return response;
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
