import { Injectable } from '@angular/core';
import { Testimonials } from '../models/testimonials.model';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { SnackBarService } from './snack-bar.service';
import { TestimonialService } from './testimonial.service';

@Injectable({
  providedIn: 'root'
})
export class TestimonialStateService {
  private activeTestimonialsSubject = new BehaviorSubject<any>(null);
  public activeTestimonialsData$: Observable<Testimonials[]> = this.activeTestimonialsSubject.asObservable();
  private allTestimonialsSubject = new BehaviorSubject<any>(null);
  public allTestimonialsData$: Observable<Testimonials[]> = this.allTestimonialsSubject.asObservable();
  private testimonialSubject = new BehaviorSubject<any>(null);
  public testimonialData$: Observable<Testimonials> = this.testimonialSubject.asObservable();
  responseMessage: any;

  constructor(private testimonialService: TestimonialService,
    private snackbarService: SnackBarService) { }

  setTestimonialSubject(data: Testimonials) {
    this.testimonialSubject.next(data);
  }

  setActiveTestimonialsSubject(data: Testimonials[]) {
    this.activeTestimonialsSubject.next(data);
  }

  setAllTestimonialsSubject(data: Testimonials[]) {
    this.allTestimonialsSubject.next(data);
  }

  getTestimonial(): Observable<Testimonials> {
    return this.testimonialService.getTestimonial().pipe(
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

  getAllTestimonials(): Observable<Testimonials[]> {
    return this.testimonialService.getAllTestimonials().pipe(
      tap((response: any) => {
        return response.sort((a: Testimonials, b: Testimonials) => {
          return a.user.firstname.localeCompare(b.user.firstname);
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

  getActiveTestimonials(): Observable<Testimonials[]> {
    return this.testimonialService.getActiveTestimonials().pipe(
      tap((response: any) => {
        return response.sort((a: Testimonials, b: Testimonials) => {
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
