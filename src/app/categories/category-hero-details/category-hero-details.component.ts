import { Component, Input } from '@angular/core';
import { Categories } from 'src/app/models/categories.interface';

@Component({
  selector: 'app-category-hero-details',
  templateUrl: './category-hero-details.component.html',
  styleUrls: ['./category-hero-details.component.css']
})
export class CategoryHeroDetailsComponent {
  @Input() categoryName: Categories | undefined;
}
