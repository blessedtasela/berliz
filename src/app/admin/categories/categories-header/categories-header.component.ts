import { Component, Input } from '@angular/core';
import { AddCategoryModalComponent } from '../add-category-modal/add-category-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';

@Component({
  selector: 'app-categories-header',
  templateUrl: './categories-header.component.html',
  styleUrls: ['./categories-header.component.css']
})
export class CategoriesHeaderComponent {
  responseMessage: any;
  showFullData: boolean = false;
  selectedSortOption: string = 'date';
  @Input() categoriesData: Categories[] = [];
  @Input() totalCategories: number = 0;
  @Input() categoriesLength: number = 0;

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private categoryStateService: CategoryStateService,
    private rxStompService: RxStompService) {
  }

  ngOnInit() { }

  handleEmitEvent() {
    this.categoryStateService.getCategories().subscribe((allCategories) => {
      this.ngxService.start()
      console.log('cached false')
      this.categoriesData = allCategories;
      this.totalCategories = this.categoriesData.length
      this.categoriesLength = this.categoriesData.length
      this.categoryStateService.setAllCategoriesSubject(this.categoriesData);
      this.ngxService.stop()
    });
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
      case 'lastUpdate':
        this.categoriesData.sort((a, b) => {
          const dateA = new Date(a.lastUpdate);
          const dateB = new Date(b.lastUpdate);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      default:
        break;
    }
  }

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
      disableClose: true,
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


}
