// src/app/services/scroll-restoration.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, Scroll } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ViewportScroller } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ScrollRestorationService implements OnDestroy {

  private positions = new Map<string, [number, number]>();
  private lastUrl = '';
  private sub!: Subscription;

  constructor(
    private router: Router,
    private scroller: ViewportScroller
  ) {}
  

  init(): void {
    this.sub = this.router.events.subscribe(event => {

      // Save position before leaving a route
      if (event instanceof NavigationStart) {
        if (this.lastUrl) {
          this.positions.set(this.lastUrl, this.scroller.getScrollPosition());
        }
      }

      // Restore position after navigation ends
      if (event instanceof NavigationEnd) {
        this.lastUrl = event.urlAfterRedirects;
        const saved = this.positions.get(this.lastUrl);

        if (saved) {
          // Small timeout lets the view render before restoring
          setTimeout(() => this.scroller.scrollToPosition(saved), 50);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}