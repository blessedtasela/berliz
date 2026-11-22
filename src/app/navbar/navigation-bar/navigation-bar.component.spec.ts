import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { NavigationBarComponent } from './navigation-bar.component';
import { AuthService } from 'src/app/services/auth.service';

describe('NavigationBarComponent', () => {
  let component: NavigationBarComponent;
  let fixture: ComponentFixture<NavigationBarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let store: MockStore;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/', events: { subscribe: () => ({}) } });
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      declarations: [NavigationBarComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({ initialState: { user: { user: { data: null } }, notifications: { myNotifications: [] } } }),
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(NavigationBarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('logged out: never dispatches loadUser/loadMyNotifications, so the public nav never shows the account menu (GN-49)', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    fixture.detectChanges();

    expect(store.dispatch).not.toHaveBeenCalled();
    expect(component.userData).toBeNull();
  });

  it('signed in on a public page: loads the user and notifications so the bell/account menu have real data (GN-49)', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    fixture.detectChanges();

    expect(store.dispatch).toHaveBeenCalledTimes(2);
  });

  // GN-80: on mobile the signed-in row (Home/bell/account) stretches to the full width of the
  // hamburger menu, so without justify-end its icons sat left-aligned -- putting the account
  // menu's trigger far from the right edge and sending its dropdown (anchored off that trigger)
  // past the left of the screen. justify-end puts the trigger where the dashboard top bar
  // already has it, where the same dropdown renders fine.
  it('right-aligns the signed-in icon row so the account menu opens where it renders correctly (GN-80)', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    fixture.detectChanges();

    const row: HTMLElement = fixture.nativeElement.querySelector('li.justify-end');
    expect(row).withContext('the signed-in icon row (Home/bell/account) should render with justify-end').not.toBeNull();
  });

  it('toggles the notification dropdown open and closed', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    fixture.detectChanges();

    expect(component.notificationDropdown).toBe(false);
    component.toggleNotificationDropdown();
    expect(component.notificationDropdown).toBe(true);
    component.closeNotificationDropdown();
    expect(component.notificationDropdown).toBe(false);
  });
});
