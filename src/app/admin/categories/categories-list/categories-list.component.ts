import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { CategoryService } from 'src/app/services/category.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { AddCategoryModalComponent } from '../add-category-modal/add-category-modal.component';
import { UpdateCategoryModalComponent } from '../update-category-modal/update-category-modal.component';
import { CategoryDetailsModalComponent } from '../category-details-modal/category-details-modal.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.css']
})
export class CategoriesListComponent implements OnInit {
  responseMessage: any;
  showFullData: boolean = false;
  @Input() categoriesData: Categories[] = [];
  @Input() totalCategories: number = 0;

  constructor(private datePipe: DatePipe,
    private categoryService: CategoryService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private rxStompService: RxStompService,
    public categoryStateService: CategoryStateService) {
  }

  ngOnInit() {
    this.watchGetCategoryFromMap()
    this.watchLikeCategory()
    this.watchUpdateCategory()
    this.watchUpdateStatus()
    this.watchDeleteCategory()
  }

  handleEmitEvent() {
    this.categoryStateService.getCategories().subscribe((allCategories) => {
      this.ngxService.start()
      this.categoriesData = allCategories;
      this.totalCategories = this.categoriesData.length
      this.categoryStateService.setAllCategoriesSubject(this.categoriesData);
      this.ngxService.stop()
    });
  }


  openUpdateCategory(id: number) {
    try {
      const category = this.categoriesData.find(category => category.id === id);
      if (category) {
        const dialogRef = this.dialog.open(UpdateCategoryModalComponent, {
          width: '900px',
          maxHeight: '600px',
          disableClose: true,
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

  openCategoryDetails(id: number) {
    try {
      const category = this.categoriesData.find(category => category.id === id);
      if (category) {
        const dialogRef = this.dialog.open(CategoryDetailsModalComponent, {
          width: '800px',
          panelClass: 'mat-dialog-height',
          data: {
            categoryData: category,
          }
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
      disableClose: true,
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
      disableClose: true,
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

  watchLikeCategory() {
    this.rxStompService.watch('/topic/likeCategory').subscribe((message) => {
      const receivedCategories: Categories = JSON.parse(message.body);
      const categoryId = this.categoriesData.findIndex(category => category.id === receivedCategories.id)
      this.categoriesData[categoryId] = receivedCategories
    });
  }

  watchUpdateCategory() {
    this.rxStompService.watch('/topic/updateCategory').subscribe((message) => {
      const receivedCategories: Categories = JSON.parse(message.body);
      const categoryId = this.categoriesData.findIndex(category => category.id === receivedCategories.id)
      this.categoriesData[categoryId] = receivedCategories
    });
  }

  watchGetCategoryFromMap() {
    this.rxStompService.watch('/topic/getCategoryFromMap').subscribe((message) => {
      const receivedCategories: Categories = JSON.parse(message.body);
      this.categoriesData.push(receivedCategories);
    });
  }

  watchUpdateStatus() {
    this.rxStompService.watch('/topic/updateCategoryStatus').subscribe((message) => {
      const receivedCategories: Categories = JSON.parse(message.body);
      const categoryId = this.categoriesData.findIndex(category => category.id === receivedCategories.id)
      this.categoriesData[categoryId] = receivedCategories
    });
  }

  watchDeleteCategory() {
    this.rxStompService.watch('/topic/deleteCategory').subscribe((message) => {
      const receivedCategories: Categories = JSON.parse(message.body);
      this.categoriesData = this.categoriesData.filter(category => category.id !== receivedCategories.id);
    });
  }

}

