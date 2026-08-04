import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of, Subscription } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectCategories } from 'src/app/state/category/category.selectors';

@Component({
  selector: 'app-search-categories',
  templateUrl: './search-categories.component.html',
  styleUrls: ['./search-categories.component.css']
})
export class SearchCategoriesComponent {
  categoriesData: Categories[] = [];
  filteredCategoriesData: Categories[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  @Output() results: EventEmitter<Categories[]> = new EventEmitter<Categories[]>()
  subscriptions: Subscription[] = [];

  constructor(private store: Store,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef) {
  }

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
        tap(() => {
          this.ngxService.start();
        }),
        switchMap((query: string) => {
          return this.search(query);
        })
      )
      .subscribe(
        (results: Categories[]) => {
          this.ngxService.stop();
          this.results.emit(results);
          console.log('Categories: ', results)
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  search(query: string): Observable<Categories[]> {
    this.subscriptions.push(
      this.store.select(selectCategories).subscribe((cachedData) => {
        this.categoriesData = cachedData;
      })
    );
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredCategoriesData = this.categoriesData;
    }
    this.filteredCategoriesData = this.categoriesData.filter((category: Categories) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return category.name.toLowerCase().includes(query);
        case 'tag':
          return category.tagNames.some(name => name.toLocaleLowerCase().includes(query));
        case 'id':
          return category.id.toString().includes(query);
        case 'description':
          return category.description.toLowerCase().includes(query);
        case 'status':
          return category.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    return of(this.filteredCategoriesData);
  }

  onSearchCriteriaChange(event: any): void {
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
  }

}
