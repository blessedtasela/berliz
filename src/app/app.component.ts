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
  title = 'berliz';
  currentRoute: any;
  private lastScrollY: number = 0;

  constructor(private router: Router, private metaService: MetaService) { }

  @HostListener('window:beforeunload')
  saveScrollPosition() {
    localStorage.setItem('scrollY', window.scrollY.toString());
  }

  ngOnInit(): void {

    // Restore scroll on refresh
    const savedY = localStorage.getItem('scrollY');
    if (savedY) {
      setTimeout(() => window.scrollTo(0, +savedY), 50);
    }

    // Save scroll before navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.lastScrollY = window.scrollY;
      }

      if (event instanceof NavigationEnd) {
        // Wait for the view to settle before restoring scroll
        setTimeout(() => {
          window.scrollTo({ top: this.lastScrollY, behavior: 'smooth' });
        }, 50);
      }
    });

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

  isPageError(): boolean {
    const loginRoutes = ['/**',];
    return this.router.url.startsWith('/**');
  }

}
