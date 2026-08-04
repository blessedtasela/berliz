import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { loadCategories } from 'src/app/state/category/category.actions';
import { selectCategories } from 'src/app/state/category/category.selectors';

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
  subscriptions: Subscription[] = [];

  constructor(private ngxService: NgxUiLoaderService,
    public store: Store,
    private rxStompService: RxStompService) {
  }

  ngOnInit(): void {
    this.ngxService.start()
    this.handleEmitEvent()
    this.ngxService.stop()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.watchLikeCategory()
    this.watchUpdateCategory()
    this.watchUpdateStatus()
    this.watchDeleteCategory()
    this.watchGetCategoryFromMap()
    this.store.dispatch(loadCategories());
    this.subscriptions.push(
      this.store.select(selectCategories).subscribe((allCategories) => {
        this.categoriesData = allCategories;
        this.totalCategories = allCategories.length
        this.categoriesLength = allCategories.length
      })
    );
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
