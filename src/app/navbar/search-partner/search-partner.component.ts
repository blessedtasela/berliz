import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Partner } from 'src/app/models/partners.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Store } from '@ngrx/store';
import { selectPartners } from 'src/app/state/partner/partner.selectors';

@Component({
  selector: 'app-search-partner',
  templateUrl: './search-partner.component.html',
  styleUrls: ['./search-partner.component.css']
})
export class SearchPartnerComponent {
  partnersData: Partner[] = [];
  filteredPartnersData: Partner[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'email';
  @Output() results: EventEmitter<Partner[]> = new EventEmitter<Partner[]>()

  constructor(private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef,
    private store: Store) { }

  ngOnInit(): void { }

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
        (results: Partner[]) => {
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

  search(query: string): Observable<Partner[]> {
    this.store.select(selectPartners).subscribe((cachedData) => {
      this.partnersData = cachedData;
    });
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredPartnersData = this.partnersData;
    }
    this.filteredPartnersData = this.partnersData.filter((partner: Partner) => {
      switch (this.selectedSearchCriteria) {
        case 'motivation':
          return partner.motivation.toLowerCase().includes(query);
        case 'id':
          return partner.id.toString().includes(query);
        case 'email':
          return partner.email.toLowerCase().includes(query);
        case 'role':
          return partner.role.toLowerCase().includes(query);
        case 'status':
          return partner.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    return of(this.filteredPartnersData);
  }

}
