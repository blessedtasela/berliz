import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Categories, CategoryLikes } from 'src/app/models/categories.interface';
import { Users } from 'src/app/models/users.interface';
import { CategoryService } from 'src/app/services/category.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { selectUser } from 'src/app/state/user/user.selector';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-categories-search-result',
  templateUrl: './categories-search-result.component.html',
  styleUrls: ['./categories-search-result.component.css']
})
export class CategoriesSearchResultComponent {
  @Input() categoriesResult: Categories[] = [];
  showFullData: boolean = false;
  visibleItems: number = 12;
  @Input() totalCategories: number = 0;
  responseMessage: any;
  user!: Users | null;
  categoryLikes: CategoryLikes[] = [];
  subscriptions: Subscription[] = []

  constructor(private datePipe: DatePipe,
    private categoryService: CategoryService,
    private store: Store,
    private rxStompService: RxStompService) { }

  ngOnInit(): void { }

  handleEmitEvent() {
    this.store.dispatch(loadActiveCategories());
    this.subscriptions.push(
      this.store.select(selectActiveCategories).subscribe((activeCategories) => {
        this.categoriesResult = activeCategories;
        this.totalCategories = activeCategories.length;
      }),
      this.store.select(selectUser).subscribe((user) => {
        this.user = user;
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

  toggleData(): void {
    this.showFullData = !this.showFullData;
    this.visibleItems = this.showFullData ? this.categoriesResult.length : 12;
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  formatStringToUrl(string: any) {
    return string.replace(/ /g, "-");
  }

  likeCategory(category: Categories) {
    this.categoryService.likeCategory(category.id).subscribe(
      (response: any) => {
        this.responseMessage = response.message;
        this.handleEmitEvent()
      },
      (error: any) => {
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        console.log('error message', this.responseMessage);
        window.alert('please login to continue')
      }
    );
  }

}
