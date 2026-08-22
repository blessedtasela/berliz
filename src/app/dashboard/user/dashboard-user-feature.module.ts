import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserModule } from './user.module';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';

// Lazy-loading wrapper covering the two `login/reset-password` and
// `login/activate-account` top-level paths, which both use this dashboard-local
// UserModule (distinct from the top-level ../../user/user.module that owns
// profile/settings — see dashboard-feature.module.ts's comment). Mounted from
// app-routing.module.ts via an empty-path parent route so both full paths
// stay exactly where they were.
const routes: Routes = [
  { path: 'login/reset-password', component: ResetPasswordComponent, data: { breadcrumb: 'Reset Password' } },
  { path: 'login/activate-account', component: ActivateAccountComponent, data: { breadcrumb: 'Activate Account' } },
];

@NgModule({
  imports: [
    UserModule,
    RouterModule.forChild(routes),
  ]
})
export class DashboardUserFeatureModule { }
