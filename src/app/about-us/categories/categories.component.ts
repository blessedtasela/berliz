import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  categoriesData: Categories[] = [];
  showFullData: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(private datePipe: DatePipe,
    private store: Store) { }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.store.dispatch(loadActiveCategories());
    this.subscriptions.push(
      this.store.select(selectActiveCategories).subscribe((activeCategories) => {
        this.categoriesData = activeCategories;
      })
    );
  }


  toggleData() {
    this.showFullData = !this.showFullData;
  }


  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}

