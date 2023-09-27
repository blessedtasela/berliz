import { Component, Input } from '@angular/core';
import { CategoryTags } from 'src/app/models/categories.interface';

@Component({
  selector: 'app-category-tags',
  templateUrl: './category-tags.component.html',
  styleUrls: ['./category-tags.component.css']
})
export class CategoryTagsComponent {
 @Input() categoryTags: CategoryTags | undefined;
}
