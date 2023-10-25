import { Injectable } from '@angular/core';
import { Tags } from '../models/tags.interface';
import { TagService } from './tag.service';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { Categories } from '../models/categories.interface';
import { SnackBarService } from './snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class TagStateService {
  private activeTagsSubject = new BehaviorSubject<any>(null);
  public activeTagsData$: Observable<Tags[]> = this.activeTagsSubject.asObservable();
  private allTagsSubject = new BehaviorSubject<any>(null);
  public allTagsData$: Observable<Tags[]> = this.allTagsSubject.asObservable();
  responseMessage: any;

  constructor(private tagService: TagService,
    private snackbarService: SnackBarService) { }

  setActiveTagsSubject(data: Tags[]) {
    this.activeTagsSubject.next(data);
  }

  setAllTagsSubject(data: Tags[]) {
    this.allTagsSubject.next(data);
  }

  getAllTags(): Observable<Tags[]> {
    return this.tagService.getAllTags().pipe(
      tap((response: any) => {
        return response.sort((a: Tags, b: Tags) => {
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

  getActiveTags(): Observable<Tags[]> {
    return this.tagService.getActiveTags().pipe(
      tap((response: any) => {
        return response.sort((a: Tags, b: Tags) => {
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


