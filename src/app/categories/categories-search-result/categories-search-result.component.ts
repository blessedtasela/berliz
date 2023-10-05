import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Categories } from 'src/app/models/categories.interface';

@Component({
  selector: 'app-categories-search-result',
  templateUrl: './categories-search-result.component.html',
  styleUrls: ['./categories-search-result.component.css']
})
export class CategoriesSearchResultComponent {
  @Input() categoriesResult: Categories[] = [];
  showFullData: boolean = false;
  @Input() totalCategories: number = 0;

  constructor(private datePipe: DatePipe) { }

  ngOnInit(): void {
 
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
}
