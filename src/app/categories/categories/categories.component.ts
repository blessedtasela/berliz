import { Component } from '@angular/core';
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
    private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.handleEmitEvent()
    // this.triggerEmitEvent()
  }

  handleEmitEvent() {
    this.categoryStateService.getActiveCategories().subscribe(() => {
      this.categories = this.categoryStateService.activeCategories;
    });
  }

  // triggerEmitEvent() {
  //   this.categoryService...subscribe(() => {
  //     this.handleEmitEvent();
  //   })
  // }

  handleSearchResults(results: Categories[]): void {
    this.categories = results;
    this.countResult = results.length;
  }

}
