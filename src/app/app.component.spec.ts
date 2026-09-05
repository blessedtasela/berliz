import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NEVER, of } from 'rxjs';
import { AppComponent } from './app.component';
import { BlurService } from './services/blur.service';
import { SidebarStateService } from './services/sidebar-state.service';
import { NewsletterTriggerService } from './shared/newsletter-popup/newsletter-trigger.service';
import { InactivityService } from './services/inactivity.service';
import { SeoService } from './services/seo.service';
import { ScrollRestorationService } from './services/scroll-restoration.service';
import { AuthService } from './services/auth.service';

describe('AppComponent', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open'], {
      afterOpened: NEVER,
      afterAllClosed: NEVER
    });
    const sidebarStateSpy = jasmine.createSpyObj('SidebarStateService', [], {
      mode$: of('expanded')
    });
    const inactivityServiceSpy = jasmine.createSpyObj('InactivityService', ['start']);
    const scrollRestorationSpy = jasmine.createSpyObj('ScrollRestorationService', ['init']);
    const seoServiceSpy = jasmine.createSpyObj('SeoService', ['updateForRoute']);
    const newsletterTriggerSpy = jasmine.createSpyObj('NewsletterTriggerService',
      ['registerPageview', 'shouldShow', 'openDelayMs', 'markShown', 'markDismissed']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    authServiceSpy.isAuthenticated.and.returnValue(true);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: '**', component: AppComponent }])],
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: BlurService, useValue: {} },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: SidebarStateService, useValue: sidebarStateSpy },
        { provide: NewsletterTriggerService, useValue: newsletterTriggerSpy },
        { provide: InactivityService, useValue: inactivityServiceSpy },
        { provide: SeoService, useValue: seoServiceSpy },
        { provide: ScrollRestorationService, useValue: scrollRestorationSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Berliz'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Berliz');
  });

  // A route the URL-pattern whitelists don't cover (the 404 wildcard chief
  // among them) used to fall through to the signed-in 'sidebar' layout
  // unconditionally -- showing the authenticated chrome to a logged-out
  // visitor. It must follow auth state instead.
  it('falls back to the public topbar layout on an unmatched route when logged out', async () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    await router.navigateByUrl('/this-route-does-not-exist');

    expect(fixture.componentInstance.activeLayout).toBe('topbar');
  });

  it('uses the sidebar layout on the same unmatched route when logged in', async () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    await router.navigateByUrl('/this-route-does-not-exist');

    expect(fixture.componentInstance.activeLayout).toBe('sidebar');
  });
});
