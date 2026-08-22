import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageModule } from './landing-page.module';
import { LandingPageComponent } from './landing-page/landing-page.component';

// Lazy-loading wrapper for the `home` route — see dashboard-feature.module.ts
// for the pattern this follows. LandingPageModule itself has no internal
// routing, so this small file supplies the RouterModule.forChild() boundary
// that lets app-routing.module.ts reach it via loadChildren instead of an
// eager top-of-file `component:` import.
const routes: Routes = [
  { path: '', component: LandingPageComponent, data: { breadcrumb: 'Home' } }
];

@NgModule({
  imports: [
    LandingPageModule,
    RouterModule.forChild(routes),
  ]
})
export class LandingFeatureModule { }
