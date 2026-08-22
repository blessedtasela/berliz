import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactUsModule } from './contact-us.module';
import { ContactUsPageComponent } from './contact-us-page/contact-us-page.component';

// Lazy-loading wrapper for the `contact` route — same pattern as
// landing-feature.module.ts.
const routes: Routes = [
  { path: '', component: ContactUsPageComponent, data: { breadcrumb: 'Contact' } }
];

@NgModule({
  imports: [
    ContactUsModule,
    RouterModule.forChild(routes),
  ]
})
export class ContactUsFeatureModule { }
