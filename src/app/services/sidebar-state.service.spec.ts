import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

import {
  SidebarStateService,
  shouldShowFloatingReopenButton,
} from './sidebar-state.service';

describe('SidebarStateService', () => {
  let service: SidebarStateService;
  let routerEvents: Subject<any>;
  let originalInnerWidth: number;

  function setInnerWidth(width: number) {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  }

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    routerEvents = new Subject<any>();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { events: routerEvents.asObservable() } },
      ],
    });

    service = TestBed.inject(SidebarStateService);
  });

  afterEach(() => {
    setInnerWidth(originalInnerWidth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Preference read → applied default ───────────────────────────────────────
  describe('applyPreferredMode', () => {
    it('seeds the desktop mode from the saved preference', () => {
      setInnerWidth(1280);
      service.applyPreferredMode('collapsed');
      expect(service.currentMode).toBe('collapsed');
    });

    it('defaults to expanded before any preference has loaded', () => {
      // Before applyPreferredMode is ever called (e.g. user record still loading),
      // the service starts in 'expanded' — matching the app's pre-existing default.
      expect(service.currentMode).toBe('expanded');
    });

    it('only applies once per session, so a later reload cannot silently undo a manual toggle', () => {
      setInnerWidth(1280);
      service.applyPreferredMode('hidden');
      service.setMode('expanded'); // user manually reopened it via the floating button
      service.applyPreferredMode('hidden'); // e.g. user record reloaded after an unrelated save
      expect(service.currentMode).toBe('expanded');
    });

    it('resetPreferenceApplied() allows a fresh seed (e.g. a new login)', () => {
      setInnerWidth(1280);
      service.applyPreferredMode('hidden');
      service.resetPreferenceApplied();
      service.applyPreferredMode('collapsed');
      expect(service.currentMode).toBe('collapsed');
    });

    it('on mobile, an "expanded" preference starts with the overlay open', () => {
      setInnerWidth(400);
      service.applyPreferredMode('expanded');
      expect(service.isMobileOverlayOpen).toBeTrue();
    });

    it('on mobile, "collapsed" and "hidden" preferences both start with the overlay closed', () => {
      setInnerWidth(400);
      service.applyPreferredMode('collapsed');
      expect(service.isMobileOverlayOpen).toBeFalse();

      service.resetPreferenceApplied();
      service.applyPreferredMode('hidden');
      expect(service.isMobileOverlayOpen).toBeFalse();
    });

    it('on desktop, an "expanded" preference does not open the mobile overlay', () => {
      setInnerWidth(1280);
      service.applyPreferredMode('expanded');
      expect(service.isMobileOverlayOpen).toBeFalse();
    });
  });

  // ── Mobile auto-close-on-navigate ────────────────────────────────────────────
  describe('mobile auto-close-on-navigate (centralized, router-driven)', () => {
    it('closes the mobile overlay on navigation when the viewport is mobile', () => {
      setInnerWidth(400);
      service.setMobileOverlayOpen(true);

      routerEvents.next(new NavigationEnd(1, '/dashboard/my-tasks', '/dashboard/my-tasks'));

      expect(service.isMobileOverlayOpen).toBeFalse();
    });

    it('does not touch desktop mode on navigation', () => {
      setInnerWidth(1280);
      service.setMode('collapsed');

      routerEvents.next(new NavigationEnd(1, '/dashboard/my-tasks', '/dashboard/my-tasks'));

      expect(service.currentMode).toBe('collapsed');
    });

    it('does not flip the mobile overlay open on desktop navigation', () => {
      setInnerWidth(1280);
      service.setMobileOverlayOpen(false);

      routerEvents.next(new NavigationEnd(1, '/dashboard', '/dashboard'));

      expect(service.isMobileOverlayOpen).toBeFalse();
    });

    it('ignores non-NavigationEnd router events', () => {
      setInnerWidth(400);
      service.setMobileOverlayOpen(true);

      routerEvents.next({ id: 1, url: '/dashboard' }); // shaped like NavigationStart, not NavigationEnd

      expect(service.isMobileOverlayOpen).toBeTrue();
    });
  });

  // ── Floating reopen button visibility ───────────────────────────────────────
  describe('shouldShowFloatingReopenButton', () => {
    it('shows on desktop only when hidden', () => {
      expect(shouldShowFloatingReopenButton(false, 'hidden', false)).toBeTrue();
      expect(shouldShowFloatingReopenButton(false, 'expanded', false)).toBeFalse();
      expect(shouldShowFloatingReopenButton(false, 'collapsed', false)).toBeFalse();
    });

    it('on mobile depends only on whether the overlay is open, regardless of mode', () => {
      expect(shouldShowFloatingReopenButton(true, 'expanded', false)).toBeTrue();
      expect(shouldShowFloatingReopenButton(true, 'expanded', true)).toBeFalse();
      expect(shouldShowFloatingReopenButton(true, 'hidden', false)).toBeTrue();
      expect(shouldShowFloatingReopenButton(true, 'collapsed', true)).toBeFalse();
    });
  });

  // ── Manual toggles still work regardless of the saved preference ───────────
  describe('manual overrides', () => {
    it('setMode always wins over whatever the preference set, on desktop', () => {
      setInnerWidth(1280);
      service.applyPreferredMode('hidden');
      service.setMode('expanded');
      expect(service.currentMode).toBe('expanded');
    });

    it('setOpen(true/false) maps onto expanded/collapsed', () => {
      service.setOpen(true);
      expect(service.currentMode).toBe('expanded');
      service.setOpen(false);
      expect(service.currentMode).toBe('collapsed');
    });

    it('toggleMobileOverlay flips the current mobile overlay state', () => {
      expect(service.isMobileOverlayOpen).toBeFalse();
      service.toggleMobileOverlay();
      expect(service.isMobileOverlayOpen).toBeTrue();
      service.toggleMobileOverlay();
      expect(service.isMobileOverlayOpen).toBeFalse();
    });
  });
});
