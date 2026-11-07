import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportProblemModule } from './report-problem.module';
import { ReportProblemPageComponent } from './report-problem-page/report-problem-page.component';
import { MyProblemReportsComponent } from './my-problem-reports/my-problem-reports.component';
import { AuthGuard } from 'src/app/services/auth.guard';

// Lazy-loading wrapper for the `report-problem` route — same pattern as
// landing-feature.module.ts. `my-reports` needs a real session (GET
// /problemReport/mine is scoped to the caller's own userId) so it carries
// AuthGuard alone -- no RoleGuard, any signed-in user can see their own reports.
const routes: Routes = [
  { path: '', component: ReportProblemPageComponent, data: { breadcrumb: 'Report Problem' } },
  { path: 'my-reports', component: MyProblemReportsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'My Reports' } }
];

@NgModule({
  imports: [
    ReportProblemModule,
    RouterModule.forChild(routes),
  ]
})
export class ReportProblemFeatureModule { }
