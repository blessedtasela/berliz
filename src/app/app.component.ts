import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'berliz';
  constructor(private router: Router,) { }

  isTopbar(): boolean {
    const topbarRoutes = ['/home', '/centers', '/trainers', '/about', '/categories', '/contact'];
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
    return loginRoutes.some(route => this.router.url.includes(route));
  }

}
