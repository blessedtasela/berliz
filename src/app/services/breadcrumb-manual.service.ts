import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbManualService {
  breadcrumbs: { label: string; url: string }[] = [];
 
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.generateBreadcrumbs(this.activatedRoute.root);
      });

    // Subscribe to route changes
    this.activatedRoute.url.subscribe(() => {
      this.generateBreadcrumbs(this.activatedRoute.root);
    });
  }

  generateBreadcrumbs(route: ActivatedRoute): Observable<{ label: string; url: string }[]> {
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
  
    return of(this.breadcrumbs);
  }
  

  private addBreadcrumb(route: ActivatedRoute, parentUrl: string): void {
    // Subscribe to route changes to ensure the route is fully activated
    route.url.subscribe((segments) => {
      const routeURL: string = segments.map((segment) => segment.path).join('/');
      if (routeURL !== '') {
        // Append a slash between parentUrl and routeURL
        parentUrl += `/${routeURL}`;
        this.breadcrumbs.push({ label: routeURL, url: parentUrl });
      }

      if (route.children.length > 0) {
        route.children.forEach((childRoute) => {
          this.addBreadcrumb(childRoute, parentUrl);
        });
      }
    });
  }

  getBreadcrumbs(): { label: string; url: string }[] {
    return this.breadcrumbs;
  }

  ngetBreadcrumbsObservable(): Observable<{ label: string; url: string }[]> {
    return this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      switchMap(() => this.generateBreadcrumbs(this.activatedRoute.root))
    );
  }

}
