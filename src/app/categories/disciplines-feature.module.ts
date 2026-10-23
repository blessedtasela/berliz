import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesModule } from './categories.module';
import { CategoriesComponent } from './categories/categories.component';
import { CategoryDetailsComponent } from './category-details/category-details.component';
import { CategoryGuard } from '../guards/category.guard';
import { EquipmentPageComponent } from '../equipments/equipment-page/equipment-page.component';
import { ExercisesSectionComponent } from '../exercises/exercises-section/exercises-section.component';

// Lazy-loading wrapper for the `disciplines` path and its children, mounted from app-routing.module.ts.
// CategoriesModule already imports EquipmentsModule and ExercisesModule internally, so EquipmentPageComponent /
// ExercisesSectionComponent are reachable through that import without listing those modules again here.
// (FAQs have their own /faqs route — see FaqsFeatureModule.)
const routes: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Disciplines' },
    children: [
      { path: '', component: CategoriesComponent, data: { breadcrumb: null } },

      // Real standalone pages, nested under /disciplines (each renders its own hero — see
      // equipment-page.component.html / exercises-section.component.html).
      { path: 'equipment', component: EquipmentPageComponent, data: { breadcrumb: 'Equipment' } },
      { path: 'exercises', component: ExercisesSectionComponent, data: { breadcrumb: 'Exercises' } },

      { path: ':id/:name', component: CategoryDetailsComponent, canActivate: [CategoryGuard], data: { breadcrumb: { alias: 'disciplineName' } } },
    ]
  }
];

@NgModule({
  imports: [
    CategoriesModule,
    RouterModule.forChild(routes),
  ]
})
export class DisciplinesFeatureModule { }
