import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { CategoryService } from 'src/app/services/category.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  categories: Categories[] = [];
  countResult: number = 0;

  constructor(private categoryStateService: CategoryStateService,
    private ngxService: NgxUiLoaderService,
    private rxStompService: RxStompService,) { }

  ngOnInit(): void {
    this.handleEmitEvent()
    this.watchLikeCategory()
    this.watchUpdateCategory()
    this.watchUpdateStatus()
    this.watchDeleteCategory()
    this.watchGetCategoryFromMap()
    // this.categoryStateService.activeCategoriesData$.subscribe((cachedData) => {
    //   if (!cachedData) {
    //     this.handleEmitEvent()
    //   } else {
    //     this.categories = cachedData;
    //   }
    // });
  }

  handleEmitEvent() {
    this.categoryStateService.getActiveCategories().subscribe((activeCategories) => {
      console.log('isCachedData false')
      this.categories = activeCategories;
      this.countResult = activeCategories.length;
      this.categoryStateService.setActiveCategoriesSubject(this.categories);
    });
  }

  handleSearchResults(results: Categories[]): void {
    this.categories = results;
    this.countResult = results.length;
  }

  watchLikeCategory() {
    this.rxStompService.watch('/topic/likeCategory').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchUpdateCategory() {
    this.rxStompService.watch('/topic/updateCategory').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchUpdateStatus() {
    this.rxStompService.watch('/topic/updateCategoryStatus').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchDeleteCategory() {
    this.rxStompService.watch('/topic/deleteCenter').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchGetCategoryFromMap() {
    this.rxStompService.watch('/topic/getCategoryFromMap').subscribe((message) => {
      this.handleEmitEvent()
    });
  }
}
