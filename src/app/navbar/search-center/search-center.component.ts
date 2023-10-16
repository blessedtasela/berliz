import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of, Subscription } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { CenterStateService } from 'src/app/services/center-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-search-center',
  templateUrl: './search-center.component.html',
  styleUrls: ['./search-center.component.css']
})
export class SearchCenterComponent {
  centersData: Centers[] = [];
  filteredCentersData: Centers[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  @Output() results: EventEmitter<Centers[]> = new EventEmitter<Centers[]>()
  subscriptions: Subscription [] = []

  constructor(private centerStateService: CenterStateService,
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
        (results: Centers[]) => {
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

  search(query: string): Observable<Centers[]> {
    this.subscriptions.push(
      this.centerStateService.allCentersData$.subscribe((cachedData => {
      this.centersData = cachedData
    }))
    )
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredCentersData = this.centersData;
    }
    this.filteredCentersData = this.centersData.filter((trainer: Centers) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return trainer.name.toLowerCase().includes(query);
        case 'address':
          return trainer.address.toLowerCase().includes(query);
          case 'location':
            return trainer.location.toLowerCase().includes(query);
        case 'motto':
          return trainer.motto.toLowerCase().includes(query);
        case 'id':
          return trainer.id.toString().includes(query);
        case 'email':
          return trainer.id.toString().includes(query);
        case 'userId':
          return trainer.partner.user.id.toString().includes(query);
        case 'partnerId':
          return trainer.partner.id.toString().includes(query);
        case 'status':
          return trainer.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    return of(this.filteredCentersData);
  }

}

