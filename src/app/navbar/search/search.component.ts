import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  categoriesData: Categories[] = [];
  totalCategories: number = 0;

  constructor(private ngxService: NgxUiLoaderService,
    public categoryStateService: CategoryStateService) {
  }


    ngOnInit(): void {
      this.categoryStateService.allCategoriesData$.subscribe((cachedData) => {
        if (!cachedData) {
          this.handleEmitEvent()
        } else {
          this.categoriesData = cachedData;
          this.totalCategories = this.categoriesData.length
        }
      });
    }
  
    handleEmitEvent() {
      this.categoryStateService.getCategories().subscribe(() => {
        this.ngxService.start()
        this.categoriesData = this.categoryStateService.allCategories;
        this.totalCategories = this.categoriesData.length
        this.categoryStateService.setAllCategoriesSubject(this.categoriesData);
        this.ngxService.stop()
      });
    }
  

  handleSearchResults(results: Categories[]): void {
    this.categoriesData = results;
    this.totalCategories = results.length;
  }

}
