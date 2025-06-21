import { Component, Input } from '@angular/core';
import { CategoryBenefits } from 'src/app/models/categories.interface';

@Component({
  selector: 'app-category-centers',
  templateUrl: './category-centers.component.html',
  styleUrls: ['./category-centers.component.css']
})
export class CategoryCentersComponent {
  @Input() categoryCenters: CategoryBenefits | undefined;
}
