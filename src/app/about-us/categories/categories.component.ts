import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Categories } from 'src/app/models/categories.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  categoriesData: Categories[] = [];
  showFullData: boolean = false;
  constructor(private datePipe: DatePipe,
    private categoryStateService: CategoryStateService) { }

  ngOnInit(): void {
    this.categoryStateService.allCategoriesData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.categoriesData = cachedData;
      }
    });
  }

  handleEmitEvent() {
    this.categoryStateService.getActiveCategories().subscribe((activeCategories) => {
      this.categoriesData = activeCategories;
    });
  }


  toggleData() {
    this.showFullData = !this.showFullData;
  }


  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}

