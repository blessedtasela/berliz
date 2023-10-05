import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { CategoryService } from 'src/app/services/category.service';
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
  @Output()results: EventEmitter<Categories[]> = new EventEmitter<Categories[]>()

  constructor(private datePipe: DatePipe,
    private categoryService: CategoryService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private elementRef: ElementRef,
    public categoryStateService: CategoryStateService) {
  }

  ngOnInit(): void {
    this.categoryStateService.allCategoriesData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.categoriesData = cachedData;
        this.filteredCategoriesData = this.categoriesData
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }


  handleEmitEvent() {
    console.log('categoryData: ', this.categoriesData)
    this.categoryStateService.getCategories().subscribe(() => {
      this.ngxService.start()
      this.categoriesData = this.categoryStateService.allCategories;
      this.filteredCategoriesData = this.categoriesData
      this.categoryStateService.setAllCategoriesSubject(this.categoriesData);
      this.ngxService.stop()
    });
  }


  initializeSearch(): void {
    fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap((query: string) => {
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
          console.log('search results: ', results)
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  search(query: string): Observable<Categories[]> {
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredCategoriesData = this.categoriesData;
    }
    this.filteredCategoriesData = this.categoriesData.filter((category: Categories) => {
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
          return category.tagSet.some(tag => tag.name.toLowerCase().includes(query));
        default:
          return false;
      }
    });
    return of(this.filteredCategoriesData);
  }

  onSearchCriteriaChange(event: any): void {
    this.ngxService.start();
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
    this.ngxService.stop()
  }

}

