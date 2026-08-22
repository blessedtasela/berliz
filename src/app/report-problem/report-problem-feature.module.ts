import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportProblemModule } from './report-problem.module';
import { ReportProblemPageComponent } from './report-problem-page/report-problem-page.component';

// Lazy-loading wrapper for the `report-problem` route — same pattern as
// landing-feature.module.ts.
const routes: Routes = [
  { path: '', component: ReportProblemPageComponent, data: { breadcrumb: 'Report Problem' } }
];

@NgModule({
  imports: [
    ReportProblemModule,
    RouterModule.forChild(routes),
  ]
})
export class ReportProblemFeatureModule { }
