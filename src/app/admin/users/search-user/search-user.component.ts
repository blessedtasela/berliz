import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';

@Component({
  selector: 'app-search-user',
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.css']
})
export class SearchUserComponent {
  usersData: Users[] = [];
  filteredUsersData: Users[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'email';
  @Output() results: EventEmitter<Users[]> = new EventEmitter<Users[]>()

  constructor(private userStateService: UserStateService,
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
        (results: Users[]) => {
          this.ngxService.stop();
          this.results.emit(results);
          console.log('users: ', results)
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  search(query: string): Observable<Users[]> {
    this.userStateService.allUsersData$.subscribe((cachedData => {
      this.usersData = cachedData
    }))
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredUsersData = this.usersData;
    }
    this.filteredUsersData = this.usersData.filter((user: Users) => {
      switch (this.selectedSearchCriteria) {
        case 'email':
          return user.email.toLowerCase().includes(query);
        case 'name':
          return (
            user.firstname.toLowerCase().includes(query) ||
            user.lastname.toLowerCase().includes(query)
          );
        case 'id':
          return user.id.toString().includes(query);
        case 'role':
          return user.role.toLowerCase().includes(query);
        case 'status':
          return user.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    return of(this.filteredUsersData);
  }

  onSearchCriteriaChange(event: any): void {
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
  }
}

