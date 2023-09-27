import { Component, Input } from '@angular/core';
import { CategoryBenefits } from 'src/app/models/categories.interface';

@Component({
  selector: 'app-category-benefits',
  templateUrl: './category-benefits.component.html',
  styleUrls: ['./category-benefits.component.css']
})
export class CategoryBenefitsComponent {
  @Input() categoryBenefits: CategoryBenefits | undefined;
}
