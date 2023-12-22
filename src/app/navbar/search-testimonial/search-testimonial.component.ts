import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Testimonials } from 'src/app/models/testimonials.model';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TestimonialStateService } from 'src/app/services/testimonial-state.service';

@Component({
  selector: 'app-search-testimonial',
  templateUrl: './search-testimonial.component.html',
  styleUrls: ['./search-testimonial.component.css']
})
export class SearchTestimonialComponent {
  testimonialsData: Testimonials[] = [];
  filteredCentersData: Testimonials[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'testimonial';
  @Output() results: EventEmitter<Testimonials[]> = new EventEmitter<Testimonials[]>()
  subscriptions: Subscription [] = []

  constructor(private testimonialStateService: TestimonialStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub=>(sub.unsubscribe()))
  }

  initializeSearch(): void {
    fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap(() => {
          this.ngxService.start();
        }),
        switchMap((query: string) => {
          return this.search(query); // Perform the search with the query
        })
      )
      .subscribe(
        (results: Testimonials[]) => {
          this.ngxService.stop();
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  // Function to handle the search select change event
  onSearchCriteriaChange(event: any): void {
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
  }

  search(query: string): Observable<Testimonials[]> {
    this.subscriptions.push(
      this.testimonialStateService.allTestimonialsData$.subscribe((cachedData => {
      this.testimonialsData = cachedData
    }))
    )
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredCentersData = this.testimonialsData;
    }
    this.filteredCentersData = this.testimonialsData.filter((testimonial: Testimonials) => {
      switch (this.selectedSearchCriteria) {
        case 'testimonial':
          return testimonial.testimonial.toLowerCase().includes(query);
        case 'email':
          return testimonial.user.email.toLowerCase().includes(query);
          case 'center':
            return testimonial.center.name.toLowerCase().includes(query);
        case 'status':
          return testimonial.status.toLowerCase().includes(query);
        case 'id':
          return testimonial.id.toString().includes(query);
        default:
          return false;
      }
    });
    return of(this.filteredCentersData);
  }

}

