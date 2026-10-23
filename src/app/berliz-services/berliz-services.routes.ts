import { Routes } from '@angular/router';

/**
 * /services — what Berliz offers (online, hybrid and in-person training, gyms & centers, the shop to come) and one
 * detail page per service. Disciplines (Boxing, Yoga…) live under /disciplines. Both pages are standalone, so no
 * feature module is needed.
 */
export const BERLIZ_SERVICES_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Services' },
    children: [
      {
        path: '',
        loadComponent: () => import('./services-page/services-page.component').then(m => m.ServicesPageComponent),
        data: { breadcrumb: null },
      },
      {
        path: ':slug',
        loadComponent: () => import('./service-detail/service-detail.component').then(m => m.ServiceDetailComponent),
        data: { breadcrumb: { alias: 'serviceName' } },
      },
    ],
  },
];
