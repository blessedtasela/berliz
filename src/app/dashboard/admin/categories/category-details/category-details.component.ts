import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, catchError, of } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { AddCategoryModalComponent } from '../add-category-modal/add-category-modal.component';
import { Categories } from 'src/app/models/categories.interface';
import { CategoryService } from 'src/app/services/category.service';
import { UpdateCategoryModalComponent } from '../update-category-modal/update-category-modal.component';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { CategoryDataService } from 'src/app/services/category-data.service';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.css']
})
export class CategoryDetailsComponent implements OnInit {
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
    private categoryService: CategoryService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private elementRef: ElementRef,
    private sharedDataService: SharedDataService) {
  }

  ngOnInit(): void {
    this.handleEmitEvent()
  }

  handleEmitEvent() {
    this.categoryDataService.getCategories().subscribe(() => {
      this.ngxService.start()
      this.initializeSearch();
      this.categoriesData = this.categoryDataService.categories;
      this.filteredCategoriesData = this.categoriesData
      this.counter = this.filteredCategoriesData.length
      this.totalCategories = this.categoriesData.length
      this.sendCategoryData();
      this.categoryDataService.getActiveCategories();
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
          return this.search(query); // Perform the search with the query
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

      case 'id':
        this.filteredCategoriesData.sort((a, b) => {
          return a.id - b.id;
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

  openAddCategory() {
    const dialogRef = this.dialog.open(AddCategoryModalComponent, {
      width: '800px',
      panelClass: 'mat-dialog-height',
    });
    const childComponentInstance = dialogRef.componentInstance as AddCategoryModalComponent;
    childComponentInstance.onAddCategoryEmit.subscribe(() => {
      this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a category');
      }
    });
  }

  openUpdateCategory(id: number) {
    try {
      const category = this.categoriesData.find(category => category.id === id);
      if (category) {
        const dialogRef = this.dialog.open(UpdateCategoryModalComponent, {
          width: '800px',
          panelClass: 'mat-dialog-height',
          data: {
            categoryData: category,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateCategoryModalComponent;

        // Set the event emitter before opening the dialog
        childComponentInstance.onUpdateCategoryEmit.subscribe(() => {
          this.handleEmitEvent()
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without adding a category');
            }
          });
        });
      } else {
        this.snackbarService.openSnackBar('category not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check category status", 'error');
    }

  }

  updateCategoryStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const category = this.categoriesData.find(category => category.id === id);
    const message = category?.status === 'false'
      ? 'activate this category?'
      : 'deactivate this category?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.categoryService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('Category status updated successfully')

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without updating category status');
            }
          })
        })
    }, (error) => {
      this.ngxService.stop();
      this.snackbarService.openSnackBar(error, 'error');
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, 'error');
    });
  }

  deleteCategory(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this category? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.categoryService.deleteCategory(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('Category deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting category');
            }
          })
        })
    }, (error) => {
      this.ngxService.stop();
      this.snackbarService.openSnackBar(error, 'error');
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, 'error');
    });
  }

  sendCategoryData() {
    this.sharedDataService.setCategoryData(this.filteredCategoriesData);
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
