import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Clients } from 'src/app/models/clients.interface';
import { ClientStateService } from 'src/app/services/client-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-search-client',
  templateUrl: './search-client.component.html',
  styleUrls: ['./search-client.component.css']
})
export class SearchClientComponent {
  clientsData: Clients[] = [];
  filteredClientsData: Clients[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'email';
  @Output() results: EventEmitter<Clients[]> = new EventEmitter<Clients[]>()
  subscriptions: Subscription[] = []

  constructor(private clientStateService: ClientStateService,
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
        (results: Clients[]) => {
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

  search(query: string): Observable<Clients[]> {
    this.subscriptions.push(
      this.clientStateService.allClientsData$.subscribe((cachedData => {
        this.clientsData = cachedData
      }))
    )
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredClientsData = this.clientsData;
    }
    this.filteredClientsData = this.clientsData.filter((client: Clients) => {
      switch (this.selectedSearchCriteria) {
        case 'email':
          return client.user.email.toLowerCase().includes(query);
        case 'motivation':
          return client.motivation.toLowerCase().includes(query);
        case 'mode':
          return client.mode.toLowerCase().includes(query);
        case 'category':
          return (
            client.categories.length > 0 &&
            client.categories.some((category) => category.name.toLowerCase().includes(query))
          );
        case 'id':
          return client.id.toString().includes(query);
        case 'userId':
          return client.user.id.toString().includes(query);
        case 'status':
          return client.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    return of(this.filteredClientsData);
  }

}

