import { query } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

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

  constructor(private categoryStateService: CategoryStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef) { }

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
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
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
          const nameA = a.tagSet[0].name.toLowerCase();
          const nameB = b.tagSet[0].name.toLowerCase();
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

  // Function to handle the search select change event
  onSearchCriteriaChange(event: any): void {
    this.ngxService.start();
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
    this.ngxService.stop()
  }

  search(query: string): Observable<Categories[]> {
    this.categoryStateService.activeCategoriesData$.subscribe((cachedData) => {
      this.categories = cachedData;
    });
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
          return category.tagSet.some(tag => tag.name.toLowerCase().includes(query));
        default:
          return false;
      }
    });
    return of(this.filteredCategories);
  }
}

