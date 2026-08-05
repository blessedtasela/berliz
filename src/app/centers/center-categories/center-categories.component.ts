import { Component, Input } from '@angular/core';
import { Categories } from 'src/app/models/categories.interface';

@Component({
  selector: 'app-center-categories',
  templateUrl: './center-categories.component.html',
  styleUrls: ['./center-categories.component.css']
})
export class CenterCategoriesComponent {
  /**
   * Active platform categories this center is registered under, resolved by the
   * parent from `Centers.categoryIds`. Replaces the legacy `CenterCategory`
   * type, which has no backing NgRx action/state.
   */
  @Input() centerCategories: Categories[] = [];

  showAllCategories: boolean = false;

  formatCategoryName(name: string | undefined): string {
    return (name ?? '').trim().replace(/\s+/g, '-').toLowerCase();
  }

  allCategories(): void {
    this.showAllCategories = !this.showAllCategories;
  }
}
