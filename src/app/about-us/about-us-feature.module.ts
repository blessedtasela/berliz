import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutUsModule } from './about-us.module';
import { AboutUsComponent } from './about-us/about-us.component';

// Lazy-loading wrapper for the `about` route — same pattern as
// landing-feature.module.ts.
const routes: Routes = [
  { path: '', component: AboutUsComponent, data: { breadcrumb: 'About' } }
];

@NgModule({
  imports: [
    AboutUsModule,
    RouterModule.forChild(routes),
  ]
})
export class AboutUsFeatureModule { }
