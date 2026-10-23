import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaqsModule } from './faqs.module';
import { FaqsPageComponent } from './faqs-page/faqs-page.component';

// Lazy-loading wrapper for /faqs, mounted from app-routing.module.ts. (It used to be a child of /services.)
const routes: Routes = [
  { path: '', component: FaqsPageComponent, data: { breadcrumb: 'FAQs' } },
];

@NgModule({
  imports: [
    FaqsModule,
    RouterModule.forChild(routes),
  ]
})
export class FaqsFeatureModule { }
