import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  categories: Categories[] = [];
  countResult: number = 0;

  constructor(private categoryStateService: CategoryStateService,
    private ngxService: NgxUiLoaderService) { }


  ngOnInit(): void {
    this.categoryStateService.activeCategoriesData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.categories = cachedData;
      }
    });
  }

  handleEmitEvent() {
    this.categoryStateService.getActiveCategories().subscribe((activeCategories) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.categories = activeCategories;
      this.categoryStateService.setActiveCategoriesSubject(this.categories);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: Categories[]): void {
    this.categories = results;
    this.countResult = results.length;
  }

}
