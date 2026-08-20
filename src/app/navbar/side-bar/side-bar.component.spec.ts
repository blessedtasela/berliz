import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

import { SideBarComponent } from './side-bar.component';
import { SidebarStateService } from 'src/app/services/sidebar-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';

describe('SideBarComponent', () => {
  let component: SideBarComponent;
  let fixture: ComponentFixture<SideBarComponent>;
  let sidebarState: SidebarStateService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    storeSpy.select.and.returnValue(of(null));

    TestBed.configureTestingModule({
      declarations: [SideBarComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: { url: '/dashboard', events: of() } },
        { provide: MatDialog, useValue: {} },
        { provide: Store, useValue: storeSpy },
        { provide: SnackBarService, useValue: {} },
        { provide: RxStompService, useValue: { watch: () => of() } },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: {} },
        SidebarStateService,
      ],
    });

    fixture = TestBed.createComponent(SideBarComponent);
    component = fixture.componentInstance;
    sidebarState = TestBed.inject(SidebarStateService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('floating reopen button', () => {
    it('is shown on desktop when the mode is hidden', () => {
      fixture.detectChanges();
      component.isMobile = false;
      sidebarState.setMode('hidden');
      expect(component.showFloatingButton).toBeTrue();
    });

    it('is hidden on desktop when expanded or collapsed', () => {
      fixture.detectChanges();
      component.isMobile = false;

      sidebarState.setMode('expanded');
      expect(component.showFloatingButton).toBeFalse();

      sidebarState.setMode('collapsed');
      expect(component.showFloatingButton).toBeFalse();
    });

    it('is shown on mobile whenever the overlay is closed, regardless of mode', () => {
      fixture.detectChanges();
      component.isMobile = true;

      sidebarState.setMobileOverlayOpen(false);
      expect(component.showFloatingButton).toBeTrue();

      sidebarState.setMobileOverlayOpen(true);
      expect(component.showFloatingButton).toBeFalse();
    });
  });

  describe('mobile overlay state reflects the shared service', () => {
    it('mirrors setMobileOverlayOpen changes onto the component', () => {
      fixture.detectChanges();

      sidebarState.setMobileOverlayOpen(true);
      expect(component.mobileOverlayOpen).toBeTrue();

      sidebarState.setMobileOverlayOpen(false);
      expect(component.mobileOverlayOpen).toBeFalse();
    });

    it('closeMobileOverlay() closes it via the service', () => {
      fixture.detectChanges();
      sidebarState.setMobileOverlayOpen(true);

      component.closeMobileOverlay();

      expect(sidebarState.isMobileOverlayOpen).toBeFalse();
      expect(component.mobileOverlayOpen).toBeFalse();
    });
  });

  describe('setMode / openSidebar', () => {
    it('setMode delegates to the sidebar state service', () => {
      fixture.detectChanges();
      component.setMode('collapsed');
      expect(sidebarState.currentMode).toBe('collapsed');
    });

    it('openSidebar() reopens the mode to expanded on desktop', () => {
      fixture.detectChanges();
      component.isMobile = false;
      sidebarState.setMode('hidden');

      component.openSidebar();

      expect(sidebarState.currentMode).toBe('expanded');
    });

    it('openSidebar() opens the mobile overlay instead of touching mode on mobile', () => {
      fixture.detectChanges();
      component.isMobile = true;
      sidebarState.setMode('hidden');

      component.openSidebar();

      expect(sidebarState.isMobileOverlayOpen).toBeTrue();
      expect(sidebarState.currentMode).toBe('hidden');
    });
  });
});
