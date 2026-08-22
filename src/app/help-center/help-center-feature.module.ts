import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelpCenterModule } from './help-center.module';
import { HelpCenterPageComponent } from './help-center-page/help-center-page.component';

// Lazy-loading wrapper for the `help-center` route — same pattern as
// landing-feature.module.ts.
const routes: Routes = [
  { path: '', component: HelpCenterPageComponent, data: { breadcrumb: 'Help Center' } }
];

@NgModule({
  imports: [
    HelpCenterModule,
    RouterModule.forChild(routes),
  ]
})
export class HelpCenterFeatureModule { }
