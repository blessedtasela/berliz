import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'berliz';
  constructor(private router: Router) { }

  isTopbar(): boolean {
    const topbarRoutes = ['/home', '/centers', '/trainers', '/about', '/categories', '/contact'];
    return topbarRoutes.some(route => this.router.url?.startsWith(route));
  }

  isSidebar(): boolean {
    const topbarRoutes = ['/dashboard', '/tasks', '/notifications', '/workspcae', '/settings'];
    return topbarRoutes.some(route => this.router.url?.startsWith(route));
  }

  isLogin(): boolean {
    return this.router.url.includes('/login')
  }

}
