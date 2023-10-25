import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Partners } from 'src/app/models/partners.interface';
import { PartnerStateService } from 'src/app/services/partner-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-search-partner',
  templateUrl: './search-partner.component.html',
  styleUrls: ['./search-partner.component.css']
})
export class SearchPartnerComponent {
  partnersData: Partners[] = [];
  filteredPartnersData: Partners[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'email';
  @Output() results: EventEmitter<Partners[]> = new EventEmitter<Partners[]>()

  constructor(private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef,
    private partnerStateService: PartnerStateService) { }

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
        (results: Partners[]) => {
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

  search(query: string): Observable<Partners[]> {
    this.partnerStateService.allPartnersData$.subscribe((cachedData) => {
      this.partnersData = cachedData;
    });
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredPartnersData = this.partnersData;
    }
    this.filteredPartnersData = this.partnersData.filter((partner: Partners) => {
      switch (this.selectedSearchCriteria) {
        case 'motivation':
          return partner.motivation.toLowerCase().includes(query);
        case 'id':
          return partner.id.toString().includes(query);
        case 'email':
          return partner.user.email.toLowerCase().includes(query);
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
