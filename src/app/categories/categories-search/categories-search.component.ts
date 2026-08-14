import { query } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of, Subscription } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';

@Component({
  selector: 'app-categories-search',
  templateUrl: './categories-search.component.html',
  styleUrls: ['./categories-search.component.css']
})
export class CategoriesSearchComponent {
  @Input() categories: Categories[] = [];
  selectedSortOption: string = 'name';
  filteredCategories: Categories[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  @Output() results: EventEmitter<Categories[]> = new EventEmitter<Categories[]>()
  subscriptions: Subscription[] = [];

  constructor(private store: Store,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }

  initializeSearch(): void {
    fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap((query: string) => {
        }),
        switchMap((query: string) => {
          return this.search(query);
        })
      )
      .subscribe(
        (results: Categories[]) => {
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
        }
      );
  }

  sortCategoriesData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.filteredCategories.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'name':
        this.filteredCategories.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        break;
      case 'tag':
        this.filteredCategories.sort((a, b) => {
          const nameA = (a.tagNames[0] || '').toLowerCase();
          const nameB = (b.tagNames[0] || '').toLowerCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        break;
      default:
        this.filteredCategories.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        break;
    }
  }

  // Function to handle the sort select change event
  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortCategoriesData();
  }


  search(query: string): Observable<Categories[]> {
    this.subscriptions.push(
      this.store.select(selectActiveCategories).subscribe((cachedData) => {
        this.categories = cachedData;
      })
    );
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredCategories = this.categories;
    }
    this.filteredCategories = this.categories.filter((category: Categories) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return category.name.toLowerCase().includes(query);
        case 'id':
          return category.id.toString().includes(query);
        case 'description':
          return category.description.toLowerCase().includes(query);
        case 'status':
          return category.status.toLowerCase().includes(query);
        case 'tag':
          return category.tagNames.some(name => name.toLowerCase().includes(query));
        default:
          return false;
      }
    });

    return of(this.filteredCategories);
  }

  searchByButton(): void {
    const query = this.searchQuery?.trim();

    if (!query) {
      this.snackbarService.openSnackBar('Please enter a search term.', 'error');
      return;
    }


    this.search(query).subscribe(
      (results) => {
        this.results.emit(results);
      },
      (error) => {
        this.snackbarService.openSnackBar('Search failed.', 'error');
      }
    );
  }

  // Function to handle the search select change event
  onSearchCriteriaChange(): void {
    this.searchByButton();
  }
}

