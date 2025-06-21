import { Component, Input } from '@angular/core';
import { CategoryBenefits } from 'src/app/models/categories.interface';

@Component({
  selector: 'app-category-trainers',
  templateUrl: './category-trainers.component.html',
  styleUrls: ['./category-trainers.component.css']
})
export class CategoryTrainersComponent {
  @Input() categoryTrainers: CategoryBenefits | undefined;
}
