import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, catchError, of } from 'rxjs';
import { Newsletter } from 'src/app/models/newsletter.model';
import { NewsletterService } from 'src/app/services/newsletter.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { Store } from '@ngrx/store';
import { selectNewsletters } from 'src/app/state/newsletter/newsletter.selectors';

@Component({
  selector: 'app-search-newsletter',
  templateUrl: './search-newsletter.component.html',
  styleUrls: ['./search-newsletter.component.css']
})
export class SearchNewsletterComponent {
  newsletterData: Newsletter[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'email';
  filteredNewsletterData: Newsletter[] = [];
  @Output() results: EventEmitter<Newsletter[]> = new EventEmitter<Newsletter[]>()

  constructor(private snackbarService: SnackBarService,
    private store: Store,
    private elementRef: ElementRef) {
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }

  initializeSearch(): void {
    fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap(() => {
        }),
        switchMap((query: string) => {
          return this.search(query);
        })
      )
      .subscribe(
        (results: Newsletter[]) => {
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
        }
      );
  }

  onSearchCriteriaChange(event: any): void {
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
  }

  search(query: string): Observable<Newsletter[]> {
    this.store.select(selectNewsletters).subscribe((cachedData) => {
      this.newsletterData = cachedData;
    })
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredNewsletterData = this.newsletterData;
    }
    this.filteredNewsletterData = this.newsletterData.filter((newsletter: Newsletter) => {
      switch (this.selectedSearchCriteria) {
        case 'email':
          return newsletter.email.toLowerCase().includes(query);
        case 'id':
          return newsletter.id.toString().includes(query);
        case 'status':
          return newsletter.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    return of(this.filteredNewsletterData);
  }

}

