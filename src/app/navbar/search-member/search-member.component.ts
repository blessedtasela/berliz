import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Members } from 'src/app/models/members.interface';
import { MemberStateService } from 'src/app/services/member-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-search-member',
  templateUrl: './search-member.component.html',
  styleUrls: ['./search-member.component.css']
})
export class SearchMemberComponent {
  centersData: Members[] = [];
  filteredMembersData: Members[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'email';
  @Output() results: EventEmitter<Members[]> = new EventEmitter<Members[]>()
  subscriptions: Subscription[] = []

  constructor(private memberStateService: MemberStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => (sub.unsubscribe()))
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
        (results: Members[]) => {
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

  search(query: string): Observable<Members[]> {
    this.subscriptions.push(
      this.memberStateService.allMembersData$.subscribe((cachedData => {
        this.centersData = cachedData
      }))
    )
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredMembersData = this.centersData;
    }
    this.filteredMembersData = this.centersData.filter((member: Members) => {
      switch (this.selectedSearchCriteria) {
        case 'email':
          return member.user.email.toLowerCase().includes(query);
        case 'motivation':
          return member.motivation.toLowerCase().includes(query);
        case 'category':
          return (
            member.categories.length > 0 &&
            member.categories.some((category) => category.name.toLowerCase().includes(query))
          );
        case 'id':
          return member.id.toString().includes(query);
        case 'userId':
          return member.user.id.toString().includes(query);
        case 'status':
          return member.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    return of(this.filteredMembersData);
  }

}

