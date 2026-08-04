import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  categories: Categories[] = [];
  countResult: number = 0;
  subscriptions: Subscription[] = [];

  constructor(private store: Store,
    private ngxService: NgxUiLoaderService,
    private rxStompService: RxStompService,) { }

  ngOnInit(): void {
    this.handleEmitEvent()
    this.watchLikeCategory()
    this.watchUpdateCategory()
    this.watchUpdateStatus()
    this.watchDeleteCategory()
    this.watchGetCategoryFromMap()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.store.dispatch(loadActiveCategories());
    this.subscriptions.push(
      this.store.select(selectActiveCategories).subscribe((activeCategories) => {
        this.categories = activeCategories;
        this.countResult = activeCategories.length;
      })
    );
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
