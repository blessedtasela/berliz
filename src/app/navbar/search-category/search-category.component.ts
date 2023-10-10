import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-search-category',
  templateUrl: './search-category.component.html',
  styleUrls: ['./search-category.component.css']
})
export class SearchCategoryComponent {
  categoriesData: Categories[] = [];
  filteredCategoriesData: Categories[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  @Output() results: EventEmitter<Categories[]> = new EventEmitter<Categories[]>()


  constructor(private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef,
    public categoryStateService: CategoryStateService) {
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
        (results: Categories[]) => {
          this.ngxService.stop();
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  search(query: string): Observable<Categories[]> {
    this.categoryStateService.allCategoriesData$.subscribe((cachedData) => {
      this.categoriesData = cachedData;
    });
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredCategoriesData = this.categoriesData;
    }
    this.filteredCategoriesData = this.categoriesData.filter((category: Categories) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return category.name && category.name.toLowerCase().includes(query);
        case 'id':
          return category.id && category.id.toString().includes(query);
        case 'description':
          return category.description && category.description.toLowerCase().includes(query);
        case 'status':
          return category.status && category.status.toLowerCase().includes(query);
        case 'tag':
          return (
            category.tagSet.length > 0 &&
            category.tagSet.some((tag) => tag.name.toLowerCase().includes(query))
          );
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

