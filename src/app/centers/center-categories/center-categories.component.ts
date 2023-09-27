import { Component, Input } from '@angular/core';
import { CenterCategory } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-categories',
  templateUrl: './center-categories.component.html',
  styleUrls: ['./center-categories.component.css']
})
export class CenterCategoriesComponent {
 @Input() centerCategories: CenterCategory | undefined;

 constructor() {

 }

 // format the trainer's name for the URL
 formatCategoryName(name: string): string {
  return name.replace(/\s+/g, '-').toLowerCase();
}
}
