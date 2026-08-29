import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CentersModule } from './centers.module';
import { CenterPageComponent } from './center-page/center-page.component';
import { CenterDetailComponent } from './center-detail/center-detail.component';
import { CenterGuard } from '../guards/center.guard';

// Lazy-loading wrapper for `centers` and `centers/:name`, mounted under
// the `centers` path segment from app-routing.module.ts.
const routes: Routes = [
  { path: '', component: CenterPageComponent, data: { breadcrumb: 'Centers' } },
  { path: ':name', component: CenterDetailComponent, canActivate: [CenterGuard], data: { breadcrumb: { alias: 'centerName' } } },
];

@NgModule({
  imports: [
    CentersModule,
    RouterModule.forChild(routes),
  ]
})
export class CentersFeatureModule { }
