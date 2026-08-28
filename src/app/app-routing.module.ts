import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ProductsPageComponent } from './products/products-page/products-page.component';
import { ProductsModule, productChildRoutes } from './products/products.module';
import { BreadcrumbService } from 'xng-breadcrumb';
import { AuthGuard } from './services/auth.guard';



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
  { path: 'home', loadChildren: () => import('./landing/landing-feature.module').then(m => m.LandingFeatureModule) },
  { path: 'contact', loadChildren: () => import('./contact-us/contact-us-feature.module').then(m => m.ContactUsFeatureModule) },
  { path: 'contact-us', redirectTo: 'contact' },
  { path: 'about', loadChildren: () => import('./about-us/about-us-feature.module').then(m => m.AboutUsFeatureModule) },
  // login, sign-up, quick-sign-up all share LoginModule — mounted at the root
  // (empty path) so all three keep their original top-level paths.
  { path: '', loadChildren: () => import('./login/login-feature.module').then(m => m.LoginFeatureModule) },
  { path: 'trainers', loadChildren: () => import('./trainers/trainers-feature.module').then(m => m.TrainersFeatureModule) },
  { path: 'centers', loadChildren: () => import('./centers/centers-feature.module').then(m => m.CentersFeatureModule) },
  { path: 'services', loadChildren: () => import('./categories/services-feature.module').then(m => m.ServicesFeatureModule) },
  { path: 'testimonials', redirectTo: 'services', pathMatch: 'full' },
  // Equipment and exercises now have real pages at /services/equipment and
  // /services/exercises (see ServicesFeatureModule's children) — these old
  // top-level paths redirect straight to the dedicated page rather than the
  // generic Programs page.
  { path: 'equipments', redirectTo: 'services/equipment', pathMatch: 'full' },
  { path: 'exercises', redirectTo: 'services/exercises', pathMatch: 'full' },
  { path: 'report-problem', loadChildren: () => import('./report-problem/report-problem-feature.module').then(m => m.ReportProblemFeatureModule) },
  // FAQs moved to /services/faqs (a real child page of Services). Keep the old
  // top-level path alive as a redirect so existing bookmarks, inbound links and
  // already-indexed search results don't 404 — same pattern as /equipments and
  // /exercises above.
  { path: 'faqs', redirectTo: 'services/faqs', pathMatch: 'full' },
  { path: 'help-center', loadChildren: () => import('./help-center/help-center-feature.module').then(m => m.HelpCenterFeatureModule) },
  { path: 'terms', loadComponent: () => import('./terms/terms-page/terms-page.component').then(m => m.TermsPageComponent), data: { breadcrumb: 'Terms' } },
  // The old "Legal & Policies" drawer widget (LegalMainComponent /
  // LegalDetailsComponent) has been retired — its content now lives directly
  // on the real /terms page (including what used to be the separate
  // Community Guidelines tab, folded in as a section). Redirect so old links
  // and bookmarks still land somewhere real, same pattern as /equipments and
  // /exercises above.
  { path: 'legal-terms', redirectTo: 'terms', pathMatch: 'full' },
  { path: 'privacy', loadComponent: () => import('./privacy/privacy-page/privacy-page.component').then(m => m.PrivacyPageComponent), data: { breadcrumb: 'Privacy' } },

  // Unlisted partner pitch page — deliberately NOT in any nav/footer, NOT in
  // sitemap.xml, and NOT in robots.txt (that file is public, so listing this
  // path there would leak it). Reachable only by whoever is given this exact
  // URL directly. Matched case-insensitively (see partnerOnepagerMatcher above)
  // since the secret gets mangled to lowercase by some sharing channels. The
  // component itself sets a noindex/nofollow meta tag as a second layer, in
  // case the URL ever leaks to a well-behaved crawler.
  { matcher: partnerOnepagerMatcher, loadChildren: () => import('./partner-onepager/partner-onepager.module').then(m => m.PartnerOnepagerModule) },
  // login/reset-password and login/activate-account share a dashboard-local
  // UserModule distinct from the top-level one — see DashboardUserFeatureModule's
  // comment. Mounted at root (empty path) since both are already full paths.
  { path: '', loadChildren: () => import('./dashboard/user/dashboard-user-feature.module').then(m => m.DashboardUserFeatureModule) },
  { path: 'shop', component: ProductsPageComponent, children: productChildRoutes, data: { breadcrumb: 'Shop' } },

  // Member profile — page itself has NO guard, so anonymous visitors can land
  // here, but the backend requires auth for the actual data (SecurityConfig).
  // The component shows a "log in to view" prompt in place of content when
  // the API call comes back unauthorized, rather than bouncing the visitor
  // away before they even see the page exists.
  { path: 'user/:username', loadComponent: () => import('./user-profile/public-profile/public-profile.component').then(m => m.PublicProfileComponent), data: { breadcrumb: 'Profile' } },

  // Member directory — discovery surface for the profiles above. Same model:
  // page loads for anyone, content requires sign-in.
  { path: 'members', loadComponent: () => import('./members-directory/members-directory.component').then(m => m.MembersDirectoryComponent), data: { breadcrumb: 'Members' } },


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

