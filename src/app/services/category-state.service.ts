import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, tap, catchError, of } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { Categories } from '../models/categories.interface';
import { CategoryService } from './category.service';
import { SnackBarService } from './snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryStateService {
  private activeCategoriesSubject = new BehaviorSubject<any>(null);
  public activeCategoriesData$: Observable<Categories[]> = this.activeCategoriesSubject.asObservable();
  private allCategoriesSubject = new BehaviorSubject<any>(null);
  public allCategoriesData$: Observable<Categories[]> = this.allCategoriesSubject.asObservable();
  responseMessage: any;

  constructor(private categoryService: CategoryService,
    private snackbarService: SnackBarService) { }

  setActiveCategoriesSubject(data: Categories[]) {
    this.activeCategoriesSubject.next(data);
  }

  setAllCategoriesSubject(data: Categories[]) {
    this.allCategoriesSubject.next(data);
  }

  getCategories(): Observable<Categories[]> {
    return this.categoryService.getCategories().pipe(
      tap((response: any) => {
        return response.sort((a: Categories, b: Categories) => {
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

  getActiveCategories(): Observable<Categories[]> {
    return this.categoryService.getActiveCategories().pipe(
      tap((response: any) => {
        return response.sort((a: Categories, b: Categories) => {
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
}

