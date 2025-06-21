import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Categories, CategoryBenefits, CategoryIntroduction, CategoryTags } from 'src/app/models/categories.interface';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.css']
})
export class CategoryDetailsComponent {
  categoryId: number = 0;
  category: Categories | undefined;
  categoryIntro: CategoryIntroduction | undefined;
  categoryBenefit: CategoryBenefits | undefined;
  categoryTag: CategoryTags | undefined;
  categoryTrainer: CategoryBenefits | undefined;
  categoryCenter: CategoryTags | undefined;

}
