import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Categories, CategoryLikes } from 'src/app/models/categories.interface';
import { Users } from 'src/app/models/users.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { CategoryService } from 'src/app/services/category.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-categories-search-result',
  templateUrl: './categories-search-result.component.html',
  styleUrls: ['./categories-search-result.component.css']
})
export class CategoriesSearchResultComponent {
  @Input() categoriesResult: Categories[] = [];
  showFullData: boolean = false;
  @Input() totalCategories: number = 0;
  responseMessage: any;
  user!: Users;
  categoryLikes: CategoryLikes[] = [];

  constructor(private datePipe: DatePipe,
    private categoryService: CategoryService,
    private categoryStateService: CategoryStateService,
    private userStateService: UserStateService,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.watchLikeCategory()
    this.watchUpdateCategory()
    this.watchUpdateStatus()
    this.userStateService.getUser().subscribe((user) => {
      this.user = user;
    })
  }

  handleEmitEvent() {
    this.categoryStateService.getActiveCategories().subscribe((activeCategories) => {
      this.categoriesResult = activeCategories;
      this.totalCategories = activeCategories.length;
      this.categoryStateService.setActiveCategoriesSubject(this.categoriesResult);
    });
    this.userStateService.getUser().subscribe((user) => {
      this.user = user;
    })
  }

  toggleData() {
    this.showFullData = !this.showFullData;
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

  isLikedCategory(category: Categories): boolean {
    return this.categoryLikes.some((categoryLike) =>
      categoryLike.user.id === this.user?.id && categoryLike.category.id === category.id
    );
  }

  watchLikeCategory() {
    this.rxStompService.watch('/topic/likeCategory').subscribe((message) => {
      const receivedCategories: Categories = JSON.parse(message.body);
      const trainerId = this.categoriesResult.findIndex(trainer => trainer.id === receivedCategories.id)
      this.categoriesResult[trainerId] = receivedCategories
    });
  }

  watchUpdateCategory() {
    this.rxStompService.watch('/topic/updateCategory').subscribe((message) => {
      const receivedCategories: Categories = JSON.parse(message.body);
      const trainerId = this.categoriesResult.findIndex(trainer => trainer.id === receivedCategories.id)
      this.categoriesResult[trainerId] = receivedCategories
    });
  }

  watchUpdateStatus() {
    this.rxStompService.watch('/topic/updateCategoryStatus').subscribe((message) => {
      const receivedCategories: Categories = JSON.parse(message.body);
      if (receivedCategories.status === 'true') {
        this.categoriesResult.push(receivedCategories);
      } else {
        this.categoriesResult = this.categoriesResult.filter(trainer => trainer.id !== receivedCategories.id);
      }
    });
  }

}
