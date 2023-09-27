import { Component, ElementRef, EventEmitter, OnInit } from '@angular/core';
import { Categories } from '../../models/categories.interface';
import { DatePipe } from '@angular/common';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CategoryDataService } from 'src/app/services/category-data.service';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.css']
})
export class CategoriesListComponent implements OnInit {
  categoriesData: Categories[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  invalidForm: boolean = false;
  selectedSortOption: string = 'date';
  filteredCategoriesData: Categories[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  counter: number = 0;
  totalCategories: number = 0;
  results: EventEmitter<Categories[]> = new EventEmitter<Categories[]>()

  constructor(private datePipe: DatePipe,
    private categoryDataService: CategoryDataService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.handleEmitEvent()
  }

  handleEmitEvent() {
    this.categoryDataService.getActiveCategories().subscribe(() => {
      this.initializeSearch();
      this.categoriesData = this.categoryDataService.activeCategories
      this.filteredCategoriesData = this.categoriesData
      this.counter = this.categoriesData.length
      this.totalCategories = this.categoriesData.length
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
        this.filteredCategoriesData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;

      case 'name':
        this.filteredCategoriesData.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        break;

      case 'tag':
        this.filteredCategoriesData.sort((a, b) => {
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
        this.filteredCategoriesData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
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
    query = query.toLowerCase();
    if (query.trim() === '') {
      // If the query is empty, return the original data
      this.filteredCategoriesData = this.categoriesData;
      this.counter = this.filteredCategoriesData.length;
      return of(this.filteredCategoriesData);
    }

    // Filter your data based on the selected criteria and search query
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
    this.counter = this.filteredCategoriesData.length;
    return of(this.filteredCategoriesData);
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }


  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
