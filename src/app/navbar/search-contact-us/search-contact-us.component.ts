import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { ContactUs } from 'src/app/models/contact-us.model';
import { ContactUsStateService } from 'src/app/services/contact-us-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-search-contact-us',
  templateUrl: './search-contact-us.component.html',
  styleUrls: ['./search-contact-us.component.css']
})
export class SearchContactUsComponent {
  contactUsData: ContactUs[] = [];
  filteredContactUsData: ContactUs[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  @Output() results: EventEmitter<ContactUs[]> = new EventEmitter<ContactUs[]>()

  constructor(private contactUsStateService: ContactUsStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
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
          this.ngxService.start();
        }),
        switchMap((query: string) => {
          return this.search(query);
        })
      )
      .subscribe(
        (results: ContactUs[]) => {
          this.ngxService.stop();
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  onSearchCriteriaChange(event: any): void {
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
  }

  search(query: string): Observable<ContactUs[]> {
    this.contactUsStateService.allContacctUsData$.subscribe((cachedData) => {
      this.contactUsData = cachedData;
    });
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredContactUsData = this.contactUsData;
    }
    this.filteredContactUsData = this.contactUsData.filter((contactUs: ContactUs) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return contactUs.name.toLowerCase().includes(query);
        case 'email':
          return contactUs.email.toLowerCase().includes(query);
        case 'id':
          return contactUs.id.toString().includes(query);
        case 'message':
          return contactUs.message.toLowerCase().includes(query);
        case 'status':
          return contactUs.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    return of(this.filteredContactUsData);
  }

}


