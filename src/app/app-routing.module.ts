import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { CenterPageComponent } from './centers/center-page/center-page.component';
import { LandingPageComponent } from './landing/landing-page/landing-page.component';
import { ContactUsPageComponent } from './contact-us/contact-us-page/contact-us-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ProductsPageComponent } from './products/products-page/products-page.component';
import { ReportProblemPageComponent } from './report-problem/report-problem-page/report-problem-page.component';
import { TrainersDetailsComponent } from './trainers/trainers-details/trainers-details.component';
import { TrainerGuard } from './guards/trainer.guard';
import { ProductsModule, productChildRoutes } from './products/products.module';
import { CenterDetailComponent } from './centers/center-detail/center-detail.component';
import { CenterGuard } from './guards/center.guard';
import { CategoryDetailsComponent } from './categories/category-details/category-details.component';
import { CategoryGuard } from './guards/category.guard';
import { CategoriesComponent } from './categories/categories/categories.component';
import { AboutUsComponent } from './about-us/about-us/about-us.component';
import { ActivateAccountComponent } from './dashboard/user/activate-account/activate-account.component';
import { ResetPasswordComponent } from './dashboard/user/reset-password/reset-password.component';
import { LoginComponent } from './login/login/login.component';
import { SignupComponent } from './login/signup/signup.component';
import { QuickSignupComponent } from './login/quick-signup/quick-signup.component';
import { BreadcrumbService } from 'xng-breadcrumb';
import { FaqsPageComponent } from './faqs/faqs-page/faqs-page.component';
import { EquipmentPageComponent } from './equipments/equipment-page/equipment-page.component';
import { ExercisesSectionComponent } from './exercises/exercises-section/exercises-section.component';
import { HelpCenterPageComponent } from './help-center/help-center-page/help-center-page.component';
import { TermsPageComponent } from './terms/terms-page/terms-page.component';
import { PrivacyPageComponent } from './privacy/privacy-page/privacy-page.component';
import { AuthGuard } from './services/auth.guard';
import { TrainersMainComponent } from './trainers/trainers-main/trainers-main.component';
import { PublicProfileComponent } from './user-profile/public-profile/public-profile.component';
import { MembersDirectoryComponent } from './members-directory/members-directory.component';



/**
 * Matches /partners/<secret> case-insensitively — the secret gets shared through
 * channels (chat apps, some email clients) that silently lowercase URLs before a
 * person can click them, so a case-sensitive `path` would 404 real, legitimate
 * visitors. Angular's `path` matching has no case-insensitive option, hence the
 * custom matcher instead of a plain path segment.
 */
const PARTNER_ONEPAGER_SECRET = 'aW3QRnVb-XxJ8DtqfSeRAhMVoGBJ5pjq'.toLowerCase();

function partnerOnepagerMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (
    segments.length === 2 &&
    segments[0].path === 'partners' &&
    segments[1].path.toLowerCase() === PARTNER_ONEPAGER_SECRET
  ) {
    return { consumed: segments };
  }
  return null;
}

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: LandingPageComponent, data: { breadcrumb: 'Home' } },
  { path: 'contact', component: ContactUsPageComponent, data: { breadcrumb: 'Contact' } },
  { path: 'contact-us', redirectTo: 'contact' },
  { path: 'about', component: AboutUsComponent, data: { breadcrumb: 'About' } },
  { path: 'login', component: LoginComponent, data: { breadcrumb: 'Login' } },
  { path: 'sign-up', component: SignupComponent, data: { breadcrumb: 'Sign Up' } },
  { path: 'quick-sign-up', component: QuickSignupComponent, data: { breadcrumb: 'Quick Sign Up' } },
  { path: 'trainers', component: TrainersMainComponent, data: { breadcrumb: 'Trainers' } },
  { path: 'trainers/:name', component: TrainersDetailsComponent, canActivate: [TrainerGuard], data: { breadcrumb: { alias: 'trainerName' } } },
  { path: 'centers', component: CenterPageComponent, data: { breadcrumb: 'Centers' } },
  { path: 'centers/:id/:name', component: CenterDetailComponent, canActivate: [CenterGuard], data: { breadcrumb: { alias: 'centerName' } } },
  {
    path: 'services',
    data: { breadcrumb: 'Services' },
    children: [
      { path: '', component: CategoriesComponent, data: { breadcrumb: null } },

      // Real standalone pages, nested under /services (each renders its own
      // hero — see equipment-page.component.html / exercises-section.component.html).
      { path: 'equipment', component: EquipmentPageComponent, data: { breadcrumb: 'Equipment' } },
      { path: 'exercises', component: ExercisesSectionComponent, data: { breadcrumb: 'Exercises' } },
      { path: 'faqs', component: FaqsPageComponent, data: { breadcrumb: 'FAQs' } },

      { path: ':id/:name', component: CategoryDetailsComponent, canActivate: [CategoryGuard], data: { breadcrumb: { alias: 'serviceName' } } },
    ]
  },
  { path: 'testimonials', redirectTo: 'services', pathMatch: 'full' },
  // Equipment and exercises now have real pages at /services/equipment and
  // /services/exercises (see the children above) — these old top-level paths
  // redirect straight to the dedicated page rather than the generic Programs page.
  { path: 'equipments', redirectTo: 'services/equipment', pathMatch: 'full' },
  { path: 'exercises', redirectTo: 'services/exercises', pathMatch: 'full' },
  { path: 'report-problem', component: ReportProblemPageComponent, data: { breadcrumb: 'Report Problem' } },
  // FAQs moved to /services/faqs (a real child page of Services). Keep the old
  // top-level path alive as a redirect so existing bookmarks, inbound links and
  // already-indexed search results don't 404 — same pattern as /equipments and
  // /exercises above.
  { path: 'faqs', redirectTo: 'services/faqs', pathMatch: 'full' },
  { path: 'help-center', component: HelpCenterPageComponent, data: { breadcrumb: 'Help Center' } },
  { path: 'terms', component: TermsPageComponent, data: { breadcrumb: 'Terms' } },
  // The old "Legal & Policies" drawer widget (LegalMainComponent /
  // LegalDetailsComponent) has been retired — its content now lives directly
  // on the real /terms page (including what used to be the separate
  // Community Guidelines tab, folded in as a section). Redirect so old links
  // and bookmarks still land somewhere real, same pattern as /equipments and
  // /exercises above.
  { path: 'legal-terms', redirectTo: 'terms', pathMatch: 'full' },
  { path: 'privacy', component: PrivacyPageComponent, data: { breadcrumb: 'Privacy' } },

  // Unlisted partner pitch page — deliberately NOT in any nav/footer, NOT in
  // sitemap.xml, and NOT in robots.txt (that file is public, so listing this
  // path there would leak it). Reachable only by whoever is given this exact
  // URL directly. Matched case-insensitively (see partnerOnepagerMatcher above)
  // since the secret gets mangled to lowercase by some sharing channels. The
  // component itself sets a noindex/nofollow meta tag as a second layer, in
  // case the URL ever leaks to a well-behaved crawler.
  { matcher: partnerOnepagerMatcher, loadChildren: () => import('./partner-onepager/partner-onepager.module').then(m => m.PartnerOnepagerModule) },
  { path: 'login/reset-password', component: ResetPasswordComponent, data: { breadcrumb: 'Reset Password' } },
  { path: 'login/activate-account', component: ActivateAccountComponent, data: { breadcrumb: 'Activate Account' } },
  { path: 'shop', component: ProductsPageComponent, children: productChildRoutes, data: { breadcrumb: 'Shop' } },

  // Member profile — page itself has NO guard, so anonymous visitors can land
  // here, but the backend requires auth for the actual data (SecurityConfig).
  // The component shows a "log in to view" prompt in place of content when
  // the API call comes back unauthorized, rather than bouncing the visitor
  // away before they even see the page exists.
  { path: 'user/:id', component: PublicProfileComponent, data: { breadcrumb: 'Profile' } },

  // Member directory — discovery surface for the profiles above. Same model:
  // page loads for anyone, content requires sign-in.
  { path: 'members', component: MembersDirectoryComponent, data: { breadcrumb: 'Members' } },


  // ── DASHBOARD ──────────────────────────────────────────
  // Entire /dashboard subtree (dashboard shell, user profile/settings,
  // notifications, tasks, subscriptions, faqs, bookings, client-intake,
  // todo-list, workouts, partnership, my-trainer, hub + its nested admin
  // routes) is now ONE lazy chunk — see dashboard-feature.module.ts for the
  // full route tree, unchanged in shape/guards/data from what used to be
  // inlined here.
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard-feature.module').then(m => m.DashboardFeatureModule)
  },

  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled'
    }),

  ],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }

