import { Injectable } from '@angular/core';
import { CategoryService } from './category.service';
import { Observable, tap, catchError, of } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { Categories } from '../models/categories.interface';
import { SnackBarService } from './snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryDataService {
  categories: Categories[] = [];
  activeCategories: Categories[] = []
  responseMessage: any;

  constructor(private categoryService: CategoryService,
    private snackbarService: SnackBarService) { }

  ngOnInit() {

  }

  getCategories(): Observable<Categories[]> {
    return this.categoryService.getCategories().pipe(
      tap((response: any) => {
        this.categories = response;
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
        this.activeCategories = response;
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
