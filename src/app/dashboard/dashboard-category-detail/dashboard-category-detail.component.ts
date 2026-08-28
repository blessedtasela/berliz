import { Component } from '@angular/core';
import { CategoryDetailsComponent } from 'src/app/categories/category-details/category-details.component';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';

/**
 * Light-themed, dashboard-native category ("service") profile — extends the
 * public component for its data/state, light template only. Mounted under
 * /dashboard/find-providers so browsing a category never leaves the
 * dashboard shell.
 */
@Component({
  selector: 'app-dashboard-category-detail',
  templateUrl: './dashboard-category-detail.component.html',
})
export class DashboardCategoryDetailComponent extends CategoryDetailsComponent {

  resolveStrapiUrl = resolveStrapiUrl;

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }
}
