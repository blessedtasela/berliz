import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesModule } from './categories.module';
import { CategoriesComponent } from './categories/categories.component';
import { CategoryDetailsComponent } from './category-details/category-details.component';
import { CategoryGuard } from '../guards/category.guard';
import { ExercisesSectionComponent } from '../exercises/exercises-section/exercises-section.component';
import { DisciplineSlugRedirectComponent } from './discipline-slug-redirect/discipline-slug-redirect.component';

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

      // Real standalone page, nested under /disciplines (renders its own hero — see
      // exercises-section.component.html).
      { path: 'exercises', component: ExercisesSectionComponent, data: { breadcrumb: 'Exercises' } },
      // GN-75 (Nov 21, 2026): MVP simplification hid the Equipment page (part of the marketplace
      // idea) -- EquipmentPageComponent and its data are untouched; only this route (and the two
      // legacy redirects into it, removed in app-routing.module.ts) are gone. Without an explicit
      // entry here, "equipment" would otherwise fall through to the :slug route below and be
      // misread as a discipline slug -- redirecting home instead, same as the ticket's other
      // hidden routes. Bring EquipmentPageComponent back here to restore the page.
      { path: 'equipment', redirectTo: '/home' },

      // /disciplines/boxing (no id) forwards to /disciplines/2/boxing.
      { path: ':slug', component: DisciplineSlugRedirectComponent, data: { breadcrumb: null } },
      { path: ':id/:name', component: CategoryDetailsComponent, canActivate: [CategoryGuard], data: { breadcrumb: { alias: 'disciplineName' } } },
    ]
  }
];

@NgModule({
  declarations: [DisciplineSlugRedirectComponent],
  imports: [
    CategoriesModule,
    RouterModule.forChild(routes),
  ]
})
export class DisciplinesFeatureModule { }
