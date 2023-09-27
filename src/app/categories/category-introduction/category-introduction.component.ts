import { Component, Input } from '@angular/core';
import { CategoryIntroduction } from 'src/app/models/categories.interface';

@Component({
  selector: 'app-category-introduction',
  templateUrl: './category-introduction.component.html',
  styleUrls: ['./category-introduction.component.css']
})
export class CategoryIntroductionComponent {
  @Input() categoryIntroduction: CategoryIntroduction | undefined;
}
