import { Component, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent {
  categoriesData: Categories[] = [];
  totalCategories: number = 0;
  categoriesLength: number = 0;
  searchComponent: string = ''
  isSearch: boolean = true;

  constructor(private ngxService: NgxUiLoaderService,
    public categoryStateService: CategoryStateService,
    private rxStompService: RxStompService,) {
  }

  ngOnInit(): void {
    this.ngxService.start()
    this.handleEmitEvent()
    this.ngxService.stop()
    // this.categoryStateService.allCategoriesData$.subscribe((cachedData) => {
    //   if (!cachedData) {
    // this.handleEmitEvent()
    //   } else {
    //     this.categoriesData = cachedData;
    //     this.totalCategories = cachedData.length
    //     this.categoriesLength = cachedData.length
    //   }
    // });
  }

  handleEmitEvent() {
    this.watchLikeCategory()
    this.watchUpdateCategory()
    this.watchUpdateStatus()
    this.watchDeleteCategory()
    this.watchGetCategoryFromMap()
    this.categoryStateService.getCategories().subscribe((allCategories) => {
      console.log('isCachedData false')
      this.categoriesData = allCategories;
      this.totalCategories = allCategories.length
      this.categoriesLength = allCategories.length
      this.categoryStateService.setAllCategoriesSubject(this.categoriesData);
    });
  }

  handleSearchResults(results: Categories[]): void {
    this.categoriesData = results;
    this.totalCategories = results.length;
    this.categoriesLength = results.length;
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
