import { Component, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent {
  categoriesData: Categories[] = [];
  totalCategories: number = 0;
  categoriesLength: number = 0;
  searchComponent: string = 'category'

  constructor(private ngxService: NgxUiLoaderService,
    public categoryStateService: CategoryStateService) {
  }

  ngOnInit(): void {
    this.categoryStateService.allCategoriesData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.categoriesData = cachedData;
        this.totalCategories = cachedData.length
        this.categoriesLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.categoryStateService.getCategories().subscribe((allCategories) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.categoriesData = allCategories;
      this.totalCategories = allCategories.length
      this.categoriesLength = allCategories.length
      this.categoryStateService.setAllCategoriesSubject(this.categoriesData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: Categories[]): void {
    this.categoriesData = results;
    this.totalCategories = results.length;
  }

}
