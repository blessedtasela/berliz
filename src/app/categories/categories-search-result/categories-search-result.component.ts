import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Categories } from 'src/app/models/categories.interface';
import { Users } from 'src/app/models/users.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { CategoryService } from 'src/app/services/category.service';
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

  constructor(private datePipe: DatePipe,
    private categoryService: CategoryService,
    private categoryStateService: CategoryStateService,
    private userStateService: UserStateService) { }

  ngOnInit(): void {
    this.userStateService.getUser().subscribe((user) => {
      this.user = user;
    })
  }

  handleEmitEvent() {
    this.categoryStateService.getActiveCategories().subscribe((activeCategories) => {
      this.categoriesResult = activeCategories;
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
        console.log('message', this.responseMessage);
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

  dislikeCategory(category: Categories) {
    this.categoryService.dislikeCategory(category.id).subscribe(
      (response: any) => {
        this.responseMessage = response.message;
        this.handleEmitEvent()
        console.log('message', this.responseMessage);
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
    return this.user?.likedCategoriesSet?.map((likedCategory) =>
      likedCategory.id).includes(category.id) || false;
  }


}
