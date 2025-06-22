import { Component, HostListener } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { MetaService } from './services/meta.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Berliz';
  currentRoute: any;

  constructor(private router: Router, private metaService: MetaService) { }

  ngOnInit(): void {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentRoute = this.router.url;

        // Fallback to global defaults
        this.metaService.updateMetaTags();

        // Handle specific cases based on the route
        if (currentRoute === '/' || currentRoute === '/home') {
          this.metaService.updateMetaTags('home');
        } else if (currentRoute.includes('/about')) {
          this.metaService.updateMetaTags('about');
        }
        // Add more conditions for other routes as needed
      }
    });
  }

  isActive(path: string): boolean {
    return this.currentRoute?.startsWith('/' + path);
  }

  isTopbar(): boolean {
    const topbarRoutes = ['/home', '/centers', '/trainers', '/about', '/services', '/contact'];
    return topbarRoutes.some(route => this.router.url?.startsWith(route));
  }

  isSidebar(): boolean {
    const topbarRoutes = ['/dashboard', '/tasks', '/notifications', '/workspace', '/settings', 'tasks'];
    return topbarRoutes.some(route => this.router.url?.startsWith(route));
  }

  isLogin(): boolean {
    const loginRoutes = ['/login', '/sign-up', 'quick-sign-up'];
    return loginRoutes.some(route => this.router.url.includes(route));
  }

  isPageNotFound(): boolean {
    const notFoundRoutes = ['/**'];
    return notFoundRoutes.some(route => this.router.url.startsWith(route));
  }

  getActiveLayout(): 'topbar' | 'login' | 'sidebar' {
    const url = this.router.url;

    if (url.startsWith('/dashboard')) return 'sidebar';
    if (url.startsWith('/login') || url.startsWith('/sign-up') || url.startsWith('/quick-sign-up')) return 'login';
    return 'topbar'; // default public routes
  }


}
