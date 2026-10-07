import { Actions } from '@ngrx/effects';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { loadCategories, loadCategoriesFailure, loadCategoriesSuccess } from 'src/app/state/category/category.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { selectCategories } from 'src/app/state/category/category.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.css'],
    standalone: false
})
export class CategoryComponent {
  categoriesData: Categories[] = [];
  totalCategories: number = 0;
  categoriesLength: number = 0;
  searchComponent: string = ''
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];
  /** Why the list couldn't be loaded -- so a failed load never reads as an empty table. */
  loadError: string | null = null;

  readonly selectCategories = selectCategories;
  readonly categorySearchFields: AdminSearchField<Categories>[] = [
    { value: 'name', label: 'Name', accessor: c => c.name },
    { value: 'id', label: 'Category id', accessor: c => c.id?.toString() },
    { value: 'description', label: 'Description', accessor: c => c.description },
    { value: 'status', label: 'Status', accessor: c => c.status },
    { value: 'tag', label: 'Tag', accessor: c => (c.tagNames || []).join(' ') },
  ];

  constructor(public store: Store,
    private rxStompService: RxStompService, private actions$: Actions) {
  }

  ngOnInit(): void {
    this.handleEmitEvent()
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
    this.subscriptions.push(watchLoadError(this.actions$, loadCategoriesFailure, [loadCategories, loadCategoriesSuccess], null, m => this.loadError = m));
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
  

  retryLoad(): void {
    this.store.dispatch(loadCategories());
  }
}
