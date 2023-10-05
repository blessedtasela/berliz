import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { AddCategoryModalComponent } from '../add-category-modal/add-category-modal.component';
import { Categories } from 'src/app/models/categories.interface';
import { CategoryService } from 'src/app/services/category.service';
import { UpdateCategoryModalComponent } from '../update-category-modal/update-category-modal.component';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { CategoryStateService } from 'src/app/services/category-state.service';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.css']
})
export class CategoryDetailsComponent implements OnInit {
  responseMessage: any;
  showFullData: boolean = false;
  selectedSortOption: string = 'date';
  @Input()categoriesData: Categories[] = [];
  @Input()totalCategories: number = 0;
  @Input() handleEmitEvent!: Function;

  constructor(private datePipe: DatePipe,
    private categoryService: CategoryService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    public categoryStateService: CategoryStateService) {
  }

  ngOnInit() {

  }

  sortCategoriesData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.categoriesData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;

      case 'name':
        this.categoriesData.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        break;

      case 'id':
        this.categoriesData.sort((a, b) => {
          return a.id - b.id;
        });
        break;

      case 'tag':
        this.categoriesData.sort((a, b) => {
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
        this.categoriesData.sort((a, b) => {
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

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
