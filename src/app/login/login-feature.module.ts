import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginModule } from './login.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { QuickSignupComponent } from './quick-signup/quick-signup.component';

// Lazy-loading wrapper covering three sibling top-level paths (`login`,
// `sign-up`, `quick-sign-up`) that all share LoginModule. Mounted from
// app-routing.module.ts via an empty-path parent route so these paths stay
// exactly where they were — this file only supplies the RouterModule.forChild()
// boundary LoginModule itself doesn't have.
const routes: Routes = [
  { path: 'login', component: LoginComponent, data: { breadcrumb: 'Login' } },
  { path: 'sign-up', component: SignupComponent, data: { breadcrumb: 'Sign Up' } },
  { path: 'quick-sign-up', component: QuickSignupComponent, data: { breadcrumb: 'Quick Sign Up' } },
];

@NgModule({
  imports: [
    LoginModule,
    RouterModule.forChild(routes),
  ]
})
export class LoginFeatureModule { }
