import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})

export class BreadcrumbService {
  breadcrumbs: { label: string; url: string }[] = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.generateBreadcrumbs(this.activatedRoute.root);
      });
  }

  private generateBreadcrumbs(route: ActivatedRoute): void {
    const root = route.snapshot;
    this.breadcrumbs = [];
    let url = '';
    const path = route.routeConfig ? (route.routeConfig.path || '') : '';
    if (path !== '') {
      url += `/${path}`;
      this.breadcrumbs.push({ label: path, url: url });
    }

    route.children.forEach((childRoute) => {
      this.addBreadcrumb(childRoute, url);
    });
  }

  private addBreadcrumb(route: ActivatedRoute, parentUrl: string): void {
    const routeURL: string = route.snapshot.url.map((segment) => segment.path).join('/');
    if (routeURL !== '') {
      parentUrl += `/${routeURL}`;
      this.breadcrumbs.push({ label: routeURL, url: parentUrl });
    }

    if (route.children.length > 0) {
      route.children.forEach((childRoute) => {
        this.addBreadcrumb(childRoute, parentUrl);
      });
    }
  }

  getBreadcrumbs(): { label: string; url: string }[] {
    return this.breadcrumbs;
  }
}
